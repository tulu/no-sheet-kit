"use client";

import { PartyPopper, Plus, Settings2 } from "lucide-react";
import { startOfMonth } from "date-fns";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import type { GoogleCalendarSubmitPrefs } from "@/components/common/google-calendar-event-options";
import { ConfirmDeleteAlertDialog } from "@/components/common/confirm-delete-alert-dialog";
import {
  FilterSidebarDesktopAside,
  FilterSidebarMobileBar,
  FilterSidebarMobileSheet,
  type FilterSidebarItem,
} from "@/components/common/filter-sidebar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { readAppViewBundlePreference, persistAppViewBundle } from "@/lib/apps/view-persistence";
import {
  appCrudToast,
  appEventsEventToast,
  appEventsTaskCommentToast,
  appEventsTaskToast,
} from "@/lib/app-toasts";
import { useAppsSessionKind, useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import {
  createEmptyNSKEventsSchema,
  type EventsDetailTab,
  type EventsGuestsViewMode,
  type EventGuestRsvpStatus,
  type NSKEvent,
  type NSKEventExpense,
  type NSKEventFamily,
  type NSKEventGuest,
  type NSKEventsSchema,
} from "@/lib/events/schema";
import { readNSKEventsStorage, writeNSKEventsStorage } from "@/lib/events/storage";
import {
  createEmptyNSKTasksSchema,
  type NSKTask,
  type NSKTasksSchema,
} from "@/lib/tasks/schema";
import { readNSKTasksStorage, writeNSKTasksStorage } from "@/lib/tasks/storage";
import {
  addTaskComment,
  applyArchivedTask,
  applyDisconnectedTask,
  archiveAllDoneInSpace,
  archiveTask,
  deleteTaskWithCalendar,
  deleteTasksWithCalendarCleanup,
  disconnectTaskCalendar,
  removeSpaceAndTasks,
  removeTaskComment,
  removeTaskFromList,
  saveTaskFromForm,
  unarchiveTask,
  updateTaskComment,
} from "@/lib/tasks/task-workspace-actions";
import { tasksInSpace } from "@/lib/tasks/tasks-helpers";
import {
  applyFamilyInvitationCascade,
  applyFamilyRsvpCascade,
  expensesInEvent,
  familiesInEvent,
  formatEventSidebarSubtitle,
  guestDisplayName,
  guestsInEvent,
  isValidEventDate,
  isValidEventTime,
  sortEvents,
} from "@/lib/events/events-helpers";
import { AddTaskSheet, type TaskFormValues } from "@/components/apps/tasks/add-task-sheet";
import { AddEventSheet, type EventFormValues } from "./add-event-sheet";
import { AddFamilySheet, type FamilyFormValues } from "./add-family-sheet";
import { AddGuestSheet, type GuestFormValues } from "./add-guest-sheet";
import { EventsInfoTab } from "./events-info-tab";
import { EventsDetailTabBar } from "./events-detail-tab-bar";
import { EventsExpensesTab } from "./events-expenses-tab";
import { AddExpenseSheet } from "./events-expense-sheets";
import { ExpensePaymentsSheet } from "./events-expense-payments-sheet";
import { EventsGuestsTab } from "./events-guests-tab";
import { EventsTasksTab } from "./events-tasks-tab";
import { ManageEventsSheet } from "./manage-events-sheet";

export function EventsAppPage() {
  const sessionSuffix = useSessionStorageSuffix();
  const sessionKind = useAppsSessionKind();
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EventsDetailTab>("info");
  const [guestsViewMode, setGuestsViewMode] = useState<EventsGuestsViewMode>("cards");
  const [groupByFamily, setGroupByFamily] = useState(false);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [eventsStore, setEventsStore] = useState<NSKEventsSchema>(createEmptyNSKEventsSchema);
  const [tasksStore, setTasksStore] = useState<NSKTasksSchema>(createEmptyNSKTasksSchema);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<NSKEvent | null>(null);
  const [eventPendingDelete, setEventPendingDelete] = useState<NSKEvent | null>(null);

  const [guestSheetOpen, setGuestSheetOpen] = useState(false);
  const [familySheetOpen, setFamilySheetOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<NSKEventFamily | null>(null);
  const [editingGuest, setEditingGuest] = useState<NSKEventGuest | null>(null);
  const [guestPendingDelete, setGuestPendingDelete] = useState<NSKEventGuest | null>(null);
  const [familyPendingDelete, setFamilyPendingDelete] = useState<NSKEventFamily | null>(null);

  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<NSKEventExpense | null>(null);
  const [expensePendingDelete, setExpensePendingDelete] = useState<NSKEventExpense | null>(null);
  const [paymentsExpense, setPaymentsExpense] = useState<NSKEventExpense | null>(null);

  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<NSKTask | null>(null);
  const [taskPendingDelete, setTaskPendingDelete] = useState<NSKTask | null>(null);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  const [tasksCalendarMonth, setTasksCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [archiveAllConfirmCount, setArchiveAllConfirmCount] = useState<number | null>(null);
  const [commentPendingDelete, setCommentPendingDelete] = useState<{
    taskId: string;
    commentId: string;
  } | null>(null);
  const [createCalendarConfirmOpen, setCreateCalendarConfirmOpen] = useState(false);
  const createCalendarConfirmResolverRef = useRef<((accepted: boolean) => void) | null>(null);

  const requestCreateCalendarConfirm = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      createCalendarConfirmResolverRef.current = resolve;
      setCreateCalendarConfirmOpen(true);
    });
  }, []);

  const resolveCreateCalendarConfirm = useCallback((accepted: boolean) => {
    createCalendarConfirmResolverRef.current?.(accepted);
    createCalendarConfirmResolverRef.current = null;
    setCreateCalendarConfirmOpen(false);
  }, []);

  function commitEvents(updater: (prev: NSKEventsSchema) => NSKEventsSchema) {
    setEventsStore((prev) => {
      const next = updater(prev);
      writeNSKEventsStorage(sessionSuffix, next);
      return next;
    });
  }

  function commitTasks(updater: (prev: NSKTasksSchema) => NSKTasksSchema) {
    setTasksStore((prev) => {
      const next = updater(prev);
      writeNSKTasksStorage(sessionSuffix, next);
      return next;
    });
  }

  useLayoutEffect(() => {
    const legacyModes = ["cards", "table", "flat", "grouped"] as const;
    const stored = readAppViewBundlePreference("events", legacyModes);
    let view: EventsGuestsViewMode = "cards";
    let grouped = false;
    if (stored === "table" || stored === "flat") view = "table";
    else if (stored === "cards") view = "cards";
    else if (stored === "grouped") {
      view = "cards";
      grouped = true;
    }
    if (stored === "flat" || stored === "grouped") {
      persistAppViewBundle("events", view);
    }
    queueMicrotask(() => {
      setEventsStore(readNSKEventsStorage(sessionSuffix));
      setTasksStore(readNSKTasksStorage(sessionSuffix));
      setGuestsViewMode(view);
      setGroupByFamily(grouped);
      setIsStoreHydrated(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hydration
  }, []);

  const eventsSorted = sortEvents(eventsStore.events);
  const activeEvent = activeEventId
    ? eventsStore.events.find((e) => e.id === activeEventId) ?? null
    : null;

  const editingTaskLive = (() => {
    if (!editingTask) return null;
    return tasksStore.tasks.find((tk) => tk.id === editingTask.id) ?? editingTask;
  })();

  const activeTasksSpaceId = activeEvent?.tasks_space_id ?? null;
  const eventTasksAll = activeTasksSpaceId
    ? tasksInSpace(tasksStore.tasks, activeTasksSpaceId, { includeArchived: true })
    : [];
  const eventTasks = activeTasksSpaceId
    ? tasksInSpace(tasksStore.tasks, activeTasksSpaceId, { includeArchived: showArchivedTasks })
    : [];

  const syncEventsUrl = useCallback(
    (eventId: string | null) => {
      const p = new URLSearchParams(searchParams.toString());
      if (eventId) p.set("event", eventId);
      else p.delete("event");
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleEventChange = useCallback(
    (eventId: string) => {
      setActiveEventId(eventId);
      syncEventsUrl(eventId);
    },
    [syncEventsUrl]
  );

  useEffect(() => {
    if (!isStoreHydrated) return;
    const raf = requestAnimationFrame(() => {
      const param = searchParams.get("event");
      if (param && eventsStore.events.some((e) => e.id === param)) {
        setActiveEventId(param);
        return;
      }
      if (eventsSorted.length > 0) {
        const fallback = eventsSorted[0]!.id;
        setActiveEventId(fallback);
        if (param !== fallback) syncEventsUrl(fallback);
      } else {
        setActiveEventId(null);
        if (param) syncEventsUrl(null);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [isStoreHydrated, searchParams, eventsStore.events, eventsSorted, syncEventsUrl]);

  const sidebarItems: FilterSidebarItem<string>[] = eventsSorted.map((ev) => ({
    id: ev.id,
    label: ev.name,
    subtitle: formatEventSidebarSubtitle(ev, locale),
    icon: PartyPopper,
    count: 0,
    hideCount: true,
  }));

  const eventFamilies = activeEventId ? familiesInEvent(eventsStore.families, activeEventId) : [];
  const eventGuests = activeEventId ? guestsInEvent(eventsStore.guests, activeEventId) : [];
  const eventExpenses = activeEventId ? expensesInEvent(eventsStore.expenses, activeEventId) : [];

  const mobileNavTitle = activeEvent?.name ?? t.events.sidebarTitle;

  function openCreateEvent() {
    setEditingEvent(null);
    setEventSheetOpen(true);
  }

  function openEditEvent(ev: NSKEvent) {
    setEditingEvent(ev);
    setEventSheetOpen(true);
    setManageSheetOpen(false);
  }

  function openDeleteEventDialog(ev: NSKEvent) {
    setEventPendingDelete(ev);
    setManageSheetOpen(false);
  }

  function handleSaveEvent(values: EventFormValues) {
    const now = new Date().toISOString();
    const start_date =
      values.start_date && isValidEventDate(values.start_date) ? values.start_date : undefined;
    const start_time =
      values.start_time && isValidEventTime(values.start_time) ? values.start_time : undefined;
    const location = values.location.trim() || undefined;

    if (editingEvent) {
      commitEvents((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === editingEvent.id
            ? {
                ...e,
                name: values.name,
                start_date,
                start_time,
                location,
                updated_at: now,
              }
            : e
        ),
      }));
      commitTasks((prev) => ({
        ...prev,
        spaces: prev.spaces.map((s) =>
          s.id === editingEvent.tasks_space_id
            ? { ...s, name: values.name, updated_at: now }
            : s
        ),
      }));
      appEventsEventToast(t, "updated");
    } else {
      const maxOrder = Math.max(-1, ...eventsStore.events.map((e) => e.order));
      const maxSpaceOrder = Math.max(-1, ...tasksStore.spaces.map((s) => s.order));
      const id = crypto.randomUUID();
      const spaceId = crypto.randomUUID();
      commitTasks((prev) => ({
        ...prev,
        spaces: [
          ...prev.spaces,
          {
            id: spaceId,
            name: values.name,
            visibility: "embedded" as const,
            order: maxSpaceOrder + 1,
            created_at: now,
            updated_at: now,
          },
        ],
      }));
      const row: NSKEvent = {
        id,
        name: values.name,
        tasks_space_id: spaceId,
        start_date,
        start_time,
        location,
        order: maxOrder + 1,
        created_at: now,
        updated_at: now,
      };
      commitEvents((prev) => ({ ...prev, events: [...prev.events, row] }));
      appEventsEventToast(t, "created");
      setActiveEventId(id);
      syncEventsUrl(id);
    }
    setEventSheetOpen(false);
    setEditingEvent(null);
  }

  async function confirmDeleteEvent() {
    if (!eventPendingDelete) return;
    const eid = eventPendingDelete.id;
    const spaceId = eventPendingDelete.tasks_space_id;
    const victims = tasksStore.tasks.filter((tk) => tk.space_id === spaceId);
    await deleteTasksWithCalendarCleanup(victims);
    commitTasks((prev) => {
      const { tasks, spaces } = removeSpaceAndTasks(prev.tasks, prev.spaces, spaceId);
      return { ...prev, tasks, spaces };
    });
    commitEvents((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== eid),
      families: prev.families.filter((f) => f.event_id !== eid),
      guests: prev.guests.filter((g) => g.event_id !== eid),
      expenses: prev.expenses.filter((ex) => ex.event_id !== eid),
    }));
    appEventsEventToast(t, "deleted");
    if (activeEventId === eid) {
      const remaining = sortEvents(eventsStore.events.filter((e) => e.id !== eid));
      const nextId = remaining[0]?.id ?? null;
      setActiveEventId(nextId);
      syncEventsUrl(nextId);
    }
    setEventPendingDelete(null);
  }

  function handleSaveFamily(values: FamilyFormValues) {
    if (editingFamily) {
      handleUpdateFamily(editingFamily, values);
      return;
    }
    if (!activeEventId) return;
    const now = new Date().toISOString();
    const maxFamilyOrder = Math.max(-1, ...eventFamilies.map((f) => f.order));
    const maxGuestOrder = Math.max(-1, ...eventGuests.map((g) => g.order));
    const familyId = crypto.randomUUID();
    const family: NSKEventFamily = {
      id: familyId,
      event_id: activeEventId,
      name: values.familyName,
      invitation_sent: false,
      rsvp_status: "pending",
      order: maxFamilyOrder + 1,
      created_at: now,
      updated_at: now,
    };
    const newGuests: NSKEventGuest[] = values.members.map((member, index) => ({
      id: crypto.randomUUID(),
      event_id: activeEventId,
      name: member.name,
      family_id: familyId,
      is_kid: member.is_kid,
      invitation_sent: false,
      rsvp_status: "pending",
      order: maxGuestOrder + 1 + index,
      created_at: now,
      updated_at: now,
    }));
    commitEvents((prev) => ({
      ...prev,
      families: [...prev.families, family],
      guests: [...prev.guests, ...newGuests],
    }));
    toast.success(t.common.appToasts.events.familyCreated.title);
    setFamilySheetOpen(false);
    setEditingFamily(null);
  }

  function handleUpdateFamily(family: NSKEventFamily, values: FamilyFormValues) {
    const now = new Date().toISOString();
    const familyId = family.id;
    const keptGuestIds = new Set(
      values.members.map((m) => m.guestId).filter((id): id is string => id != null)
    );

    commitEvents((prev) => {
      let guests = prev.guests.filter((g) => {
        if (g.family_id !== familyId) return true;
        return keptGuestIds.has(g.id);
      });

      const maxGuestOrder = Math.max(-1, ...guests.map((g) => g.order));
      let newGuestCount = 0;

      for (const member of values.members) {
        if (member.guestId) {
          guests = guests.map((g) =>
            g.id === member.guestId
              ? {
                  ...g,
                  name: member.name,
                  is_kid: member.is_kid,
                  updated_at: now,
                }
              : g
          );
        } else {
          guests.push({
            id: crypto.randomUUID(),
            event_id: family.event_id,
            name: member.name,
            family_id: familyId,
            is_kid: member.is_kid,
            invitation_sent: false,
            rsvp_status: "pending",
            order: maxGuestOrder + 1 + newGuestCount++,
            created_at: now,
            updated_at: now,
          });
        }
      }

      return {
        ...prev,
        families: prev.families.map((f) =>
          f.id === familyId ? { ...f, name: values.familyName, updated_at: now } : f
        ),
        guests,
      };
    });
    toast.success(t.common.appToasts.events.familyUpdated.title);
    setFamilySheetOpen(false);
    setEditingFamily(null);
  }
  const editingFamilyGuests = editingFamily
    ? eventGuests.filter((g) => g.family_id === editingFamily.id)
    : [];

  function openAddFamilySheet() {
    setEditingFamily(null);
    setFamilySheetOpen(true);
  }

  function openEditFamilySheet(family: NSKEventFamily) {
    setEditingFamily(family);
    setFamilySheetOpen(true);
  }

  function closeFamilySheet() {
    setFamilySheetOpen(false);
    setEditingFamily(null);
  }

  function handleFamilyInvitation(familyId: string, sent: boolean) {
    commitEvents((prev) => applyFamilyInvitationCascade(prev, familyId, sent));
  }

  function handleFamilyRsvp(familyId: string, status: EventGuestRsvpStatus) {
    commitEvents((prev) => applyFamilyRsvpCascade(prev, familyId, status));
  }

  function confirmDeleteFamily() {
    if (!familyPendingDelete) return;
    const fid = familyPendingDelete.id;
    const now = new Date().toISOString();
    commitEvents((prev) => ({
      ...prev,
      families: prev.families.filter((f) => f.id !== fid),
      guests: prev.guests.map((g) =>
        g.family_id === fid ? { ...g, family_id: undefined, updated_at: now } : g
      ),
    }));
    setFamilyPendingDelete(null);
  }

  function handleSaveGuest(values: GuestFormValues) {
    if (!activeEventId && !editingGuest) return;
    const now = new Date().toISOString();
    const newFamilyName = values.new_family_name?.trim();
    const createdFamilyInline = Boolean(newFamilyName);

    if (editingGuest) {
      commitEvents((prev) => {
        let families = prev.families;
        let familyId = values.family_id || undefined;
        if (newFamilyName) {
          const maxFamilyOrder = Math.max(
            -1,
            ...families.filter((f) => f.event_id === activeEventId).map((f) => f.order)
          );
          const id = crypto.randomUUID();
          families = [
            ...families,
            {
              id,
              event_id: activeEventId!,
              name: newFamilyName,
              invitation_sent: false,
              rsvp_status: "pending",
              order: maxFamilyOrder + 1,
              created_at: now,
              updated_at: now,
            },
          ];
          familyId = id;
        }

        return {
          ...prev,
          families,
          guests: prev.guests.map((g) =>
            g.id === editingGuest.id
              ? {
                  ...g,
                  name: values.name,
                  last_name: values.last_name || undefined,
                  email: values.email || undefined,
                  phone: values.phone || undefined,
                  dietary_restrictions: values.dietary_restrictions || undefined,
                  family_id: familyId,
                  is_kid: values.is_kid,
                  invitation_sent: values.invitation_sent,
                  rsvp_status: values.rsvp_status,
                  updated_at: now,
                }
              : g
          ),
        };
      });
      if (createdFamilyInline) {
        toast.success(t.common.appToasts.events.familyCreated.title);
      }
      appCrudToast(t, "events", "updated");
    } else {
      commitEvents((prev) => {
        let families = prev.families;
        let familyId = values.family_id || undefined;
        if (newFamilyName) {
          const maxFamilyOrder = Math.max(
            -1,
            ...families.filter((f) => f.event_id === activeEventId).map((f) => f.order)
          );
          const id = crypto.randomUUID();
          families = [
            ...families,
            {
              id,
              event_id: activeEventId!,
              name: newFamilyName,
              invitation_sent: false,
              rsvp_status: "pending",
              order: maxFamilyOrder + 1,
              created_at: now,
              updated_at: now,
            },
          ];
          familyId = id;
        }

        const maxOrder = Math.max(-1, ...prev.guests.filter((g) => g.event_id === activeEventId).map((g) => g.order));
        return {
          ...prev,
          families,
          guests: [
            ...prev.guests,
            {
              id: crypto.randomUUID(),
              event_id: activeEventId!,
              name: values.name,
              last_name: values.last_name || undefined,
              email: values.email || undefined,
              phone: values.phone || undefined,
              dietary_restrictions: values.dietary_restrictions || undefined,
              family_id: familyId,
              is_kid: values.is_kid,
              invitation_sent: values.invitation_sent,
              rsvp_status: values.rsvp_status,
              order: maxOrder + 1,
              created_at: now,
              updated_at: now,
            },
          ],
        };
      });
      if (createdFamilyInline) {
        toast.success(t.common.appToasts.events.familyCreated.title);
      }
      appCrudToast(t, "events", "created");
    }
    setGuestSheetOpen(false);
    setEditingGuest(null);
  }

  function confirmDeleteGuest() {
    if (!guestPendingDelete) return;
    commitEvents((prev) => ({
      ...prev,
      guests: prev.guests.filter((g) => g.id !== guestPendingDelete.id),
    }));
    appCrudToast(t, "events", "deleted");
    setGuestPendingDelete(null);
  }

  function handleSaveExpense(values: { name: string; total_amount: string; currency: string }) {
    if (!activeEventId && !editingExpense) return;
    const now = new Date().toISOString();
    if (editingExpense) {
      commitEvents((prev) => ({
        ...prev,
        expenses: prev.expenses.map((ex) =>
          ex.id === editingExpense.id
            ? {
                ...ex,
                name: values.name,
                total_amount: values.total_amount,
                currency: values.currency,
                updated_at: now,
              }
            : ex
        ),
      }));
    } else {
      const maxOrder = Math.max(-1, ...eventExpenses.map((e) => e.order));
      commitEvents((prev) => ({
        ...prev,
        expenses: [
          ...prev.expenses,
          {
            id: crypto.randomUUID(),
            event_id: activeEventId!,
            name: values.name,
            total_amount: values.total_amount,
            currency: values.currency,
            payments: [],
            order: maxOrder + 1,
            created_at: now,
            updated_at: now,
          },
        ],
      }));
    }
    setExpenseSheetOpen(false);
    setEditingExpense(null);
  }

  function confirmDeleteExpense() {
    if (!expensePendingDelete) return;
    commitEvents((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expensePendingDelete.id),
    }));
    setExpensePendingDelete(null);
  }

  async function handleSaveTaskFromForm(
    values: TaskFormValues,
    calendar: GoogleCalendarSubmitPrefs
  ): Promise<boolean> {
    if (!activeEvent) return false;
    const targetSpaceId = activeEvent.tasks_space_id;

    const result = await saveTaskFromForm({
      tasks: tasksStore.tasks,
      spaces: tasksStore.spaces,
      values: { ...values, space_id: targetSpaceId },
      calendar,
      editingTask,
      targetSpaceId,
      activeSpaceId: targetSpaceId,
      sessionKind,
      calendarContext: { kind: "event", eventName: activeEvent.name },
      t,
      locale,
      requestCreateCalendarConfirm,
      onCalendarSyncError: () => toast.error(t.googleCalendar.syncError),
      allowSpaceChange: false,
    });

    if (!result.ok) return false;
    commitTasks((prev) => ({ ...prev, tasks: result.tasks }));
    appEventsTaskToast(t, editingTask ? "updated" : "created");
    return true;
  }

  async function handleDisconnectTaskCalendar() {
    const live = editingTaskLive;
    if (!live?.google_calendar_event_id) return;
    const updated = await disconnectTaskCalendar(live);
    commitTasks((prev) => ({ ...prev, tasks: applyDisconnectedTask(prev.tasks, updated) }));
    setEditingTask((prev) =>
      prev && prev.id === live.id
        ? {
            ...prev,
            google_calendar_event_id: undefined,
            google_calendar_email_reminder_minutes: undefined,
          }
        : prev
    );
  }

  function handleAddComment(taskId: string, body: string) {
    commitTasks((prev) => ({ ...prev, tasks: addTaskComment(prev.tasks, taskId, body) }));
    appEventsTaskCommentToast(t, "created");
  }

  function handleUpdateComment(taskId: string, commentId: string, body: string) {
    commitTasks((prev) => ({
      ...prev,
      tasks: updateTaskComment(prev.tasks, taskId, commentId, body),
    }));
    appEventsTaskCommentToast(t, "updated");
  }

  function confirmDeleteComment() {
    if (!commentPendingDelete) return;
    const { taskId, commentId } = commentPendingDelete;
    commitTasks((prev) => ({
      ...prev,
      tasks: removeTaskComment(prev.tasks, taskId, commentId),
    }));
    appEventsTaskCommentToast(t, "deleted");
    setCommentPendingDelete(null);
  }

  async function handleArchiveTask(task: NSKTask) {
    const archived = await archiveTask(task);
    commitTasks((prev) => ({ ...prev, tasks: applyArchivedTask(prev.tasks, archived) }));
  }

  function requestArchiveAllDone() {
    if (!activeTasksSpaceId) return;
    const count = tasksStore.tasks.filter(
      (tk) => tk.space_id === activeTasksSpaceId && tk.status === "done" && !tk.archived
    ).length;
    if (count === 0) return;
    setArchiveAllConfirmCount(count);
  }

  async function confirmArchiveAllDone() {
    if (!activeTasksSpaceId || archiveAllConfirmCount == null) return;
    const next = await archiveAllDoneInSpace(tasksStore.tasks, activeTasksSpaceId);
    commitTasks((prev) => ({ ...prev, tasks: next }));
    setArchiveAllConfirmCount(null);
  }

  function handleUnarchiveTask(task: NSKTask) {
    const updated = unarchiveTask(task);
    commitTasks((prev) => ({ ...prev, tasks: applyArchivedTask(prev.tasks, updated) }));
  }

  async function confirmDeleteTask() {
    if (!taskPendingDelete) return;
    await deleteTaskWithCalendar(taskPendingDelete);
    commitTasks((prev) => ({
      ...prev,
      tasks: removeTaskFromList(prev.tasks, taskPendingDelete.id),
    }));
    appEventsTaskToast(t, "deleted");
    setTaskPendingDelete(null);
  }

  function handleTasksReplace(nextTasks: NSKTask[]) {
    commitTasks((prev) => ({ ...prev, tasks: nextTasks }));
  }

  function handleUpdateExpensePayments(expenseId: string, payments: NSKEventExpense["payments"]) {
    const now = new Date().toISOString();
    commitEvents((prev) => ({
      ...prev,
      expenses: prev.expenses.map((ex) =>
        ex.id === expenseId ? { ...ex, payments, updated_at: now } : ex
      ),
    }));
  }

  const paymentsExpenseLive = paymentsExpense
    ? eventsStore.expenses.find((e) => e.id === paymentsExpense.id) ?? null
    : null;

  const deleteTaskDescription = taskPendingDelete?.google_calendar_event_id
    ? `${t.events.tasks.deleteTaskDescription.replace("{label}", taskPendingDelete.title)}\n\n${t.googleCalendar.deleteItemAlsoDeletesEvent}`
    : t.events.tasks.deleteTaskDescription.replace(
        "{label}",
        taskPendingDelete?.title ?? ""
      );

  const manageFooter = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full gap-2"
      onClick={() => setManageSheetOpen(true)}
    >
      <Settings2 className="size-4 shrink-0" aria-hidden />
      {t.events.manageEventsTitle}
    </Button>
  );

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={eventPendingDelete != null}
        onOpenChange={(open) => !open && setEventPendingDelete(null)}
        title={t.events.deleteEventTitle}
        description={
          eventPendingDelete
            ? t.events.deleteEventDescription.replace("{name}", eventPendingDelete.name)
            : ""
        }
        itemLabel={null}
        cancelLabel={t.events.deleteCancel}
        confirmLabel={t.events.deleteConfirm}
        onConfirm={confirmDeleteEvent}
      />
      <ConfirmDeleteAlertDialog
        open={guestPendingDelete != null}
        onOpenChange={(open) => !open && setGuestPendingDelete(null)}
        title={t.events.guests.deleteGuest}
        description={t.events.guests.deleteGuestDescription}
        itemLabel={guestPendingDelete ? guestDisplayName(guestPendingDelete) : null}
        cancelLabel={t.events.deleteCancel}
        confirmLabel={t.events.deleteConfirm}
        onConfirm={confirmDeleteGuest}
      />
      <ConfirmDeleteAlertDialog
        open={familyPendingDelete != null}
        onOpenChange={(open) => !open && setFamilyPendingDelete(null)}
        title={t.events.guests.deleteFamily}
        description={t.events.guests.deleteFamilyDescription}
        itemLabel={familyPendingDelete?.name ?? null}
        cancelLabel={t.events.deleteCancel}
        confirmLabel={t.events.deleteConfirm}
        onConfirm={confirmDeleteFamily}
      />
      <ConfirmDeleteAlertDialog
        open={expensePendingDelete != null}
        onOpenChange={(open) => !open && setExpensePendingDelete(null)}
        title={t.events.expenses.deleteExpense}
        description={t.events.expenses.deleteExpenseDescription}
        itemLabel={expensePendingDelete?.name ?? null}
        cancelLabel={t.events.deleteCancel}
        confirmLabel={t.events.deleteConfirm}
        onConfirm={confirmDeleteExpense}
      />
      <ConfirmDeleteAlertDialog
        open={taskPendingDelete != null}
        onOpenChange={(open) => !open && setTaskPendingDelete(null)}
        title={t.events.tasks.deleteTaskTitle}
        description={deleteTaskDescription}
        itemLabel={null}
        cancelLabel={t.events.tasks.deleteCancel}
        confirmLabel={t.events.tasks.deleteConfirm}
        onConfirm={confirmDeleteTask}
      />
      <ConfirmDeleteAlertDialog
        open={commentPendingDelete != null}
        onOpenChange={(open) => !open && setCommentPendingDelete(null)}
        title={t.events.tasks.deleteCommentTitle}
        description={t.events.tasks.deleteCommentDescription}
        itemLabel={null}
        cancelLabel={t.events.tasks.deleteCancel}
        confirmLabel={t.events.tasks.deleteConfirm}
        onConfirm={confirmDeleteComment}
      />
      <AlertDialog
        open={archiveAllConfirmCount != null}
        onOpenChange={(open) => !open && setArchiveAllConfirmCount(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.events.tasks.archiveAllConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.events.tasks.archiveAllConfirmDescription.replace(
                "{count}",
                String(archiveAllConfirmCount ?? 0)
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.events.tasks.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmArchiveAllDone()}>
              {t.events.tasks.archiveAllConfirmAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={createCalendarConfirmOpen}
        onOpenChange={(open) => {
          if (!open) resolveCreateCalendarConfirm(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.googleCalendar.confirmCreateCalendarTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.googleCalendar.confirmCreateCalendarIfMissing}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => resolveCreateCalendarConfirm(false)}>
              {t.googleCalendar.confirmCreateCalendarCancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => resolveCreateCalendarConfirm(true)}>
              {t.googleCalendar.confirmCreateCalendarConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
        <FilterSidebarDesktopAside
          title={t.events.sidebarTitle}
          items={sidebarItems}
          activeId={activeEventId ?? ""}
          onFilterChange={handleEventChange}
          footer={manageFooter}
        />
        <FilterSidebarMobileSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title={t.events.sidebarTitle}
          items={sidebarItems}
          activeId={activeEventId ?? ""}
          onFilterChange={handleEventChange}
          onAfterSelect={() => setFiltersOpen(false)}
          footer={manageFooter}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <FilterSidebarMobileBar
            title={mobileNavTitle}
            onOpen={() => setFiltersOpen(true)}
            openButtonAriaLabel={t.events.openEventsNav}
          />

          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            {!isStoreHydrated ? null : eventsSorted.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PartyPopper />
                  </EmptyMedia>
                  <EmptyTitle>{t.events.emptyEventsTitle}</EmptyTitle>
                  <EmptyDescription>{t.events.emptyEventsBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={openCreateEvent}>
                    <Plus className="mr-1 size-4" />
                    {t.events.addEvent}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : !activeEvent ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyTitle>{t.events.emptyEventSelectedTitle}</EmptyTitle>
                  <EmptyDescription>{t.events.emptyEventSelectedBody}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-6">
                <EventsDetailTabBar activeTab={activeTab} onTabChange={setActiveTab} />
                {activeTab === "info" ? (
                  <EventsInfoTab
                    guests={eventGuests}
                    families={eventFamilies}
                    tasks={eventTasksAll}
                    expenses={eventExpenses}
                    locale={locale}
                  />
                ) : null}
                {activeTab === "guests" ? (
                  <EventsGuestsTab
                    event={activeEvent}
                    families={eventFamilies}
                    guests={eventGuests}
                    guestsViewMode={guestsViewMode}
                    onGuestsViewModeChange={setGuestsViewMode}
                    groupByFamily={groupByFamily}
                    onGroupByFamilyChange={setGroupByFamily}
                    onAddFamily={openAddFamilySheet}
                    onEditFamily={openEditFamilySheet}
                    onDeleteFamily={setFamilyPendingDelete}
                    onFamilyInvitationChange={handleFamilyInvitation}
                    onFamilyRsvpChange={handleFamilyRsvp}
                    onAddGuest={() => {
                      setEditingGuest(null);
                      setGuestSheetOpen(true);
                    }}
                    onEditGuest={(g) => {
                      setEditingGuest(g);
                      setGuestSheetOpen(true);
                    }}
                    onDeleteGuest={setGuestPendingDelete}
                    onGuestInvitationChange={(guestId, sent) => {
                      const now = new Date().toISOString();
                      commitEvents((prev) => ({
                        ...prev,
                        guests: prev.guests.map((g) =>
                          g.id === guestId ? { ...g, invitation_sent: sent, updated_at: now } : g
                        ),
                      }));
                    }}
                    onGuestRsvpChange={(guestId, status) => {
                      const now = new Date().toISOString();
                      commitEvents((prev) => ({
                        ...prev,
                        guests: prev.guests.map((g) =>
                          g.id === guestId ? { ...g, rsvp_status: status, updated_at: now } : g
                        ),
                      }));
                    }}
                  />
                ) : null}
                {activeTab === "tasks" && activeTasksSpaceId ? (
                  <EventsTasksTab
                    spaceId={activeTasksSpaceId}
                    tasks={eventTasks}
                    allTasks={tasksStore.tasks}
                    showArchived={showArchivedTasks}
                    onShowArchivedChange={setShowArchivedTasks}
                    calendarMonth={tasksCalendarMonth}
                    onCalendarMonthChange={setTasksCalendarMonth}
                    onTasksReplace={handleTasksReplace}
                    onAddTask={() => {
                      setEditingTask(null);
                      setTaskSheetOpen(true);
                    }}
                    onEditTask={(task) => {
                      setEditingTask(task);
                      setTaskSheetOpen(true);
                    }}
                    onDeleteTask={setTaskPendingDelete}
                    onArchive={handleArchiveTask}
                    onUnarchive={handleUnarchiveTask}
                    onArchiveAllDone={requestArchiveAllDone}
                  />
                ) : null}
                {activeTab === "expenses" ? (
                  <EventsExpensesTab
                    expenses={eventExpenses}
                    locale={locale}
                    onAddExpense={() => {
                      setEditingExpense(null);
                      setExpenseSheetOpen(true);
                    }}
                    onEditExpense={(ex) => {
                      setEditingExpense(ex);
                      setExpenseSheetOpen(true);
                    }}
                    onDeleteExpense={setExpensePendingDelete}
                    onViewPayments={setPaymentsExpense}
                    onAddPayment={setPaymentsExpense}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <ManageEventsSheet
        open={manageSheetOpen}
        onOpenChange={setManageSheetOpen}
        events={eventsSorted}
        onAddEvent={() => {
          setManageSheetOpen(false);
          openCreateEvent();
        }}
        onEditEvent={openEditEvent}
        onDeleteEvent={openDeleteEventDialog}
      />

      <AddEventSheet
        open={eventSheetOpen}
        editingEvent={editingEvent}
        onClose={() => {
          setEventSheetOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSaveEvent}
      />

      <AddGuestSheet
        open={guestSheetOpen}
        editingGuest={editingGuest}
        families={eventFamilies}
        onClose={() => {
          setGuestSheetOpen(false);
          setEditingGuest(null);
        }}
        onSubmit={handleSaveGuest}
      />

      <AddFamilySheet
        open={familySheetOpen}
        editingFamily={editingFamily}
        familyGuests={editingFamilyGuests}
        onClose={closeFamilySheet}
        onSubmit={handleSaveFamily}
      />

      <AddTaskSheet
        open={taskSheetOpen}
        editingItem={editingTaskLive}
        spaces={
          activeTasksSpaceId
            ? tasksStore.spaces.filter((s) => s.id === activeTasksSpaceId)
            : []
        }
        defaultSpaceId={activeTasksSpaceId ?? ""}
        variant="events"
        onClose={() => {
          setTaskSheetOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTaskFromForm}
        onDisconnectGoogleCalendar={handleDisconnectTaskCalendar}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={(taskId, commentId) => setCommentPendingDelete({ taskId, commentId })}
      />

      <AddExpenseSheet
        open={expenseSheetOpen}
        editingExpense={editingExpense}
        onClose={() => {
          setExpenseSheetOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
      />

      <ExpensePaymentsSheet
        open={paymentsExpense != null}
        expense={paymentsExpenseLive}
        onClose={() => setPaymentsExpense(null)}
        onUpdatePayments={handleUpdateExpensePayments}
      />
    </div>
  );
}

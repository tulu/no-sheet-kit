"use client";

import { Calendar, Folder, LayoutDashboard, LayoutGrid, List, Settings2 } from "lucide-react";
import { startOfMonth } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import type { GoogleCalendarSubmitPrefs } from "@/components/common/google-calendar-event-options";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
import { ConfirmDeleteAlertDialog } from "@/components/common/confirm-delete-alert-dialog";
import {
  FilterSidebarDesktopAside,
  FilterSidebarMobileBar,
  FilterSidebarMobileSheet,
  type FilterSidebarItem,
} from "@/components/common/filter-sidebar";
import { ListSearchEmptyState } from "@/components/common/list-search-empty";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useAppLocalHydration } from "@/lib/apps/use-app-local-hydration";
import { filterItemsBySearch } from "@/lib/apps/filter-items-by-search";
import { persistAppViewBundle } from "@/lib/apps/view-persistence";
import {
  appCrudToast,
  appTasksCommentToast,
  appTasksSpaceToast,
} from "@/lib/app-toasts";
import {
  createEmptyNSKTasksSchema,
  TASKS_DASHBOARD_NAV_ID,
  TASKS_VIEW_MODES,
  type NSKSpace,
  type NSKTask,
  type NSKTasksSchema,
  type TasksViewMode,
} from "@/lib/tasks/schema";
import { readNSKTasksStorage, writeNSKTasksStorage } from "@/lib/tasks/storage";
import { nskCalendarDeleteEvent } from "@/lib/google/calendar-sync-client";
import { useAppsSessionKind, useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import {
  addTaskComment,
  applyArchivedTask,
  applyDisconnectedTask,
  archiveAllDoneInSpace,
  archiveTask,
  deleteTaskWithCalendar,
  disconnectTaskCalendar,
  removeTaskComment,
  removeTaskFromList,
  saveTaskFromForm,
  unarchiveTask,
  updateTaskComment,
} from "@/lib/tasks/task-workspace-actions";
import {
  isUserVisibleSpace,
  sortSpaces,
  taskMatchesSearch,
  taskSpaceDropId,
  tasksInSpace,
  userVisibleSpaces,
  userVisibleTasksSchema,
} from "@/lib/tasks/tasks-helpers";
import { TasksKanbanDndProvider } from "./tasks-kanban-dnd-provider";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import { AddSpaceSheet } from "./add-space-sheet";
import { AddTaskSheet } from "./add-task-sheet";
import { DeleteSpaceWithTasksDialog } from "./delete-space-with-tasks-dialog";
import { ManageSpacesSheet } from "./manage-spaces-sheet";
import { TasksDashboard } from "./tasks-dashboard";
import { TasksView } from "./tasks-view";
import { TasksViewSkeleton } from "./tasks-view-skeleton";

type NavId = typeof TASKS_DASHBOARD_NAV_ID | string;

export function TasksAppPage() {
  const sessionSuffix = useSessionStorageSuffix();
  const sessionKind = useAppsSessionKind();
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState<NavId>(TASKS_DASHBOARD_NAV_ID);
  /** Brief pulse + scroll after `?highlight=` from dashboard (cleared from URL immediately). */
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TasksViewMode>("kanban");
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [store, setStore] = useState<NSKTasksSchema>(createEmptyNSKTasksSchema);
  const [taskSearch, setTaskSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [taskKanbanDragging, setTaskKanbanDragging] = useState(false);

  const [spaceSheetOpen, setSpaceSheetOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [reopenManageAfterSpaceSheet, setReopenManageAfterSpaceSheet] = useState(false);
  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<NSKSpace | null>(null);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<NSKTask | null>(null);

  const [taskPendingDelete, setTaskPendingDelete] = useState<NSKTask | null>(null);
  const [spacePendingDelete, setSpacePendingDelete] = useState<NSKSpace | null>(null);
  const [spaceDeleteWithTasks, setSpaceDeleteWithTasks] = useState<NSKSpace | null>(null);
  const [commentPendingDelete, setCommentPendingDelete] = useState<{
    taskId: string;
    commentId: string;
  } | null>(null);
  const [archiveAllConfirmCount, setArchiveAllConfirmCount] = useState<number | null>(null);
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

  useAppLocalHydration(() => readNSKTasksStorage(sessionSuffix), setStore, setIsStoreHydrated, {
    appViewKey: "tasks",
    validModes: TASKS_VIEW_MODES,
    defaultView: "kanban",
    setViewMode,
  });

  const syncTasksUrlToNav = useCallback(
    (next: NavId) => {
      const p = new URLSearchParams(searchParams.toString());
      p.delete("highlight");
      if (next === TASKS_DASHBOARD_NAV_ID) {
        p.delete("space");
      } else {
        p.set("space", next);
      }
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleNavChange = useCallback(
    (next: NavId) => {
      setActiveNav(next);
      setHighlightTaskId(null);
      syncTasksUrlToNav(next);
    },
    [syncTasksUrlToNav]
  );

  useEffect(() => {
    if (!isStoreHydrated) return;
    const raf = requestAnimationFrame(() => {
      const highlight = searchParams.get("highlight");
      const space = searchParams.get("space");

      if (highlight) {
        const task = store.tasks.find((t) => t.id === highlight);
        if (task && store.spaces.some((s) => s.id === task.space_id && isUserVisibleSpace(s))) {
          setActiveNav(task.space_id);
          setHighlightTaskId(task.id);
          const p = new URLSearchParams(searchParams.toString());
          p.delete("highlight");
          p.set("space", task.space_id);
          const qs = p.toString();
          router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
          return;
        }
      }

      if (space && store.spaces.some((s) => s.id === space && isUserVisibleSpace(s))) {
        setActiveNav(space);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [isStoreHydrated, searchParams, store.tasks, store.spaces, router, pathname]);

  useEffect(() => {
    if (!highlightTaskId || !isStoreHydrated) return;
    const raf = requestAnimationFrame(() => {
      const sel = `[data-task-id="${CSS.escape(highlightTaskId)}"]`;
      document.querySelector(sel)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    const tid = window.setTimeout(() => setHighlightTaskId(null), 2400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(tid);
    };
  }, [highlightTaskId, isStoreHydrated]);

  const commit = useCallback(
    (updater: (prev: NSKTasksSchema) => NSKTasksSchema) => {
      setStore((prev) => {
        const next = updater(prev);
        writeNSKTasksStorage(sessionSuffix, next);
        return next;
      });
    },
    [sessionSuffix]
  );

  /** Keep task sheet in sync with store (comments, status from Kanban, etc.). */
  const editingTaskLive = (() => {
    if (!editingTask) return null;
    return store.tasks.find((t) => t.id === editingTask.id) ?? editingTask;
  })();

  async function handleDisconnectTaskCalendar() {
    const live = editingTaskLive;
    if (!live?.google_calendar_event_id) return;
    const updated = await disconnectTaskCalendar(live);
    commit((prev) => ({ ...prev, tasks: applyDisconnectedTask(prev.tasks, updated) }));
    setEditingTask((prev) => (prev && prev.id === live.id ? updated : prev));
  }

  const spacesSorted = sortSpaces(userVisibleSpaces(store.spaces));

  const sidebarItems: FilterSidebarItem<NavId>[] = (() => {
    const rows: FilterSidebarItem<NavId>[] = [
      {
        id: TASKS_DASHBOARD_NAV_ID,
        label: t.tasks.dashboardNav,
        icon: LayoutDashboard,
        count: 0,
        hideCount: true,
        tone: "accent",
      },
    ];
    for (const sp of spacesSorted) {
      const c = store.tasks.filter((x) => x.space_id === sp.id && (!showArchived ? !x.archived : true)).length;
      rows.push({
        id: sp.id,
        label: sp.name,
        icon: Folder,
        count: c,
        dividerBefore: rows.length === 1,
      });
    }
    return rows;
  })();

  const activeSpaceId = activeNav === TASKS_DASHBOARD_NAV_ID ? null : activeNav;
  const spaceTasksRaw = (() => {
    if (!activeSpaceId) return [];
    return tasksInSpace(store.tasks, activeSpaceId, { includeArchived: showArchived });
  })();

  const searchFilteredTasks = filterItemsBySearch(spaceTasksRaw, taskSearch, taskMatchesSearch);

  function handleViewModeChange(next: TasksViewMode) {
    setViewMode(next);
    persistAppViewBundle("tasks", next);
    if (next === "calendar") {
      setCalendarMonth(startOfMonth(new Date()));
    }
  }

  const mobileNavTitle =
    activeNav === TASKS_DASHBOARD_NAV_ID
      ? t.tasks.dashboardNav
      : (userVisibleSpaces(store.spaces).find((s) => s.id === activeNav)?.name ?? t.tasks.sidebarTitle);

  function openCreateTask() {
    if (!activeSpaceId) return;
    setEditingTask(null);
    setTaskSheetOpen(true);
  }

  function openEditTask(task: NSKTask) {
    setEditingTask(task);
    setTaskSheetOpen(true);
  }

  function openCreateSpace() {
    setEditingSpace(null);
    setSpaceSheetOpen(true);
  }

  function openCreateSpaceFromDashboard() {
    setReopenManageAfterSpaceSheet(false);
    openCreateSpace();
  }

  function openEditSpace(space: NSKSpace) {
    setEditingSpace(space);
    setSpaceSheetOpen(true);
  }

  function closeSpaceSheet() {
    setSpaceSheetOpen(false);
    setEditingSpace(null);
    if (reopenManageAfterSpaceSheet) {
      setReopenManageAfterSpaceSheet(false);
      setManageSheetOpen(true);
    }
  }

  function openManageSpaces() {
    setManageSheetOpen(true);
  }

  function openAddSpaceFromManage() {
    setReopenManageAfterSpaceSheet(true);
    setManageSheetOpen(false);
    openCreateSpace();
  }

  function openRenameSpaceFromManage(space: NSKSpace) {
    setReopenManageAfterSpaceSheet(true);
    setManageSheetOpen(false);
    openEditSpace(space);
  }

  function requestDeleteSpace(space: NSKSpace) {
    const taskCount = store.tasks.filter((x) => x.space_id === space.id).length;
    if (taskCount === 0) {
      setSpacePendingDelete(space);
      return;
    }
    setSpaceDeleteWithTasks(space);
  }

  function dismissSpaceSheetAfterSave() {
    setSpaceSheetOpen(false);
    setEditingSpace(null);
    setReopenManageAfterSpaceSheet(false);
  }

  function handleSpaceSubmit(name: string) {
    const now = new Date().toISOString();
    if (editingSpace) {
      commit((prev) => ({
        ...prev,
        spaces: prev.spaces.map((s) =>
          s.id === editingSpace.id ? { ...s, name, updated_at: now } : s
        ),
      }));
      appTasksSpaceToast(t, "updated");
      dismissSpaceSheetAfterSave();
      return;
    }
    commit((prev) => {
      const maxOrder = Math.max(-1, ...prev.spaces.map((s) => s.order));
      const id = crypto.randomUUID();
      return {
        ...prev,
        spaces: [...prev.spaces, { id, name, order: maxOrder + 1, created_at: now, updated_at: now }],
      };
    });
    appTasksSpaceToast(t, "created");
    dismissSpaceSheetAfterSave();
  }

  function confirmDeleteSpace() {
    if (!spacePendingDelete) return;
    const sid = spacePendingDelete.id;
    commit((prev) => ({
      ...prev,
      spaces: prev.spaces.filter((s) => s.id !== sid),
      tasks: prev.tasks.filter((x) => x.space_id !== sid),
    }));
    appTasksSpaceToast(t, "deleted");
    if (activeNav === sid) {
      setActiveNav(TASKS_DASHBOARD_NAV_ID);
      setHighlightTaskId(null);
      syncTasksUrlToNav(TASKS_DASHBOARD_NAV_ID);
    }
    setSpacePendingDelete(null);
  }

  function confirmDeleteSpaceMoveTasks(targetSpaceId: string) {
    if (!spaceDeleteWithTasks) return;
    const sid = spaceDeleteWithTasks.id;
    const now = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      spaces: prev.spaces.filter((s) => s.id !== sid),
      tasks: prev.tasks.map((x) =>
        x.space_id === sid ? { ...x, space_id: targetSpaceId, updated_at: now } : x
      ),
    }));
    appTasksSpaceToast(t, "deleted");
    if (activeNav === sid) {
      setActiveNav(TASKS_DASHBOARD_NAV_ID);
      setHighlightTaskId(null);
      syncTasksUrlToNav(TASKS_DASHBOARD_NAV_ID);
    }
    setSpaceDeleteWithTasks(null);
    setManageSheetOpen(false);
  }

  async function confirmDeleteSpaceAndAllTasks() {
    if (!spaceDeleteWithTasks) return;
    const sid = spaceDeleteWithTasks.id;
    const victims = store.tasks.filter((x) => x.space_id === sid);
    await Promise.all(
      victims.map((x) =>
        x.google_calendar_event_id ? nskCalendarDeleteEvent(x.google_calendar_event_id) : Promise.resolve()
      )
    );
    commit((prev) => ({
      ...prev,
      spaces: prev.spaces.filter((s) => s.id !== sid),
      tasks: prev.tasks.filter((x) => x.space_id !== sid),
    }));
    appTasksSpaceToast(t, "deleted");
    if (activeNav === sid) {
      setActiveNav(TASKS_DASHBOARD_NAV_ID);
      setHighlightTaskId(null);
      syncTasksUrlToNav(TASKS_DASHBOARD_NAV_ID);
    }
    setSpaceDeleteWithTasks(null);
    setManageSheetOpen(false);
  }

  async function handleSaveTaskFromForm(
    values: { title: string; description: string; due_date: string; space_id: string },
    calendar: GoogleCalendarSubmitPrefs
  ): Promise<boolean> {
    const targetSpaceId = values.space_id || activeSpaceId;
    if (!targetSpaceId) return false;

    const spaceName = store.spaces.find((s) => s.id === targetSpaceId)?.name;
    const result = await saveTaskFromForm({
      tasks: store.tasks,
      spaces: store.spaces,
      values,
      calendar,
      editingTask,
      targetSpaceId,
      activeSpaceId,
      sessionKind,
      calendarContext: { kind: "space", spaceName },
      t,
      locale,
      requestCreateCalendarConfirm,
      onCalendarSyncError: () => toast.error(t.googleCalendar.syncError),
    });

    if (!result.ok) return false;
    commit((prev) => ({ ...prev, tasks: result.tasks }));
    appCrudToast(t, "tasks", editingTask ? "updated" : "created");
    if (result.navigateToSpaceId) {
      setActiveNav(result.navigateToSpaceId);
      setHighlightTaskId(null);
      syncTasksUrlToNav(result.navigateToSpaceId);
    }
    return true;
  }

  function handleAddComment(taskId: string, body: string) {
    commit((prev) => ({ ...prev, tasks: addTaskComment(prev.tasks, taskId, body) }));
    appTasksCommentToast(t, "created");
  }

  function handleUpdateComment(taskId: string, commentId: string, body: string) {
    commit((prev) => ({
      ...prev,
      tasks: updateTaskComment(prev.tasks, taskId, commentId, body),
    }));
    appTasksCommentToast(t, "updated");
  }

  function confirmDeleteComment() {
    if (!commentPendingDelete) return;
    const { taskId, commentId } = commentPendingDelete;
    commit((prev) => ({
      ...prev,
      tasks: removeTaskComment(prev.tasks, taskId, commentId),
    }));
    appTasksCommentToast(t, "deleted");
    setCommentPendingDelete(null);
  }

  async function handleArchive(task: NSKTask) {
    const archived = await archiveTask(task);
    commit((prev) => ({ ...prev, tasks: applyArchivedTask(prev.tasks, archived) }));
  }

  function requestArchiveAllDone() {
    if (!activeSpaceId) return;
    const count = store.tasks.filter(
      (t) => t.space_id === activeSpaceId && t.status === "done" && !t.archived
    ).length;
    if (count === 0) return;
    setArchiveAllConfirmCount(count);
  }

  async function confirmArchiveAllDone() {
    if (!activeSpaceId || archiveAllConfirmCount == null) return;
    const next = await archiveAllDoneInSpace(store.tasks, activeSpaceId);
    commit((prev) => ({ ...prev, tasks: next }));
    setArchiveAllConfirmCount(null);
  }

  function handleUnarchive(task: NSKTask) {
    const updated = unarchiveTask(task);
    commit((prev) => ({ ...prev, tasks: applyArchivedTask(prev.tasks, updated) }));
  }

  async function confirmDeleteTask() {
    if (!taskPendingDelete) return;
    await deleteTaskWithCalendar(taskPendingDelete);
    commit((prev) => ({
      ...prev,
      tasks: removeTaskFromList(prev.tasks, taskPendingDelete.id),
    }));
    appCrudToast(t, "tasks", "deleted");
    setTaskPendingDelete(null);
  }

  function handleTasksReplace(nextTasks: NSKTask[]) {
    commit((prev) => ({ ...prev, tasks: nextTasks }));
  }

  const cardLabels = {
    edit: t.tasks.edit,
    delete: t.tasks.delete,
    archive: t.tasks.archive,
    unarchive: t.tasks.unarchive,
    cardActionsMenu: t.tasks.cardActionsMenu,
  };

  const listLabels = {
    ...cardLabels,
    tableTitle: t.tasks.table.title,
    tableStatus: t.tasks.table.status,
    tableDue: t.tasks.table.dueDate,
    tableComments: t.tasks.table.comments,
    tableArchived: t.tasks.table.archived,
  };

  const columnTitles = {
    todo: t.tasks.columns.todo,
    inProgress: t.tasks.columns.inProgress,
    done: t.tasks.columns.done,
  };

  const statusLabel = {
    todo: t.tasks.statusLabels.todo,
    in_progress: t.tasks.statusLabels.in_progress,
    done: t.tasks.statusLabels.done,
  };

  const deleteTaskDescription = taskPendingDelete?.google_calendar_event_id
    ? `${t.tasks.deleteTaskDescription}\n\n${t.googleCalendar.deleteItemAlsoDeletesEvent}`
    : t.tasks.deleteTaskDescription;

  const kanbanSpaceDnD =
    isStoreHydrated && viewMode === "kanban" && activeSpaceId != null;

  const spaceDropNavProps = kanbanSpaceDnD
    ? {
        getDropTargetId: (id: NavId) =>
          id === TASKS_DASHBOARD_NAV_ID ? null : taskSpaceDropId(id),
        showDropTargets: taskKanbanDragging,
      }
    : {};

  function handleTaskMovedToSpace(targetSpaceId: string) {
    setActiveNav(targetSpaceId);
    setHighlightTaskId(null);
    syncTasksUrlToNav(targetSpaceId);
    setFiltersOpen(false);
  }

  const tasksWorkspace = (
    <>
      <FilterSidebarDesktopAside<NavId>
        title={t.tasks.sidebarTitle}
        items={sidebarItems}
        activeId={activeNav}
        onFilterChange={handleNavChange}
        {...spaceDropNavProps}
        footer={
          <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={openManageSpaces}>
            <Settings2 className="size-4 shrink-0" aria-hidden />
            {t.tasks.manageSpacesTitle}
          </Button>
        }
      />

      <FilterSidebarMobileSheet<NavId>
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title={t.tasks.sidebarTitle}
        items={sidebarItems}
        activeId={activeNav}
        onFilterChange={handleNavChange}
        {...spaceDropNavProps}
        footer={
          <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={openManageSpaces}>
            <Settings2 className="size-4 shrink-0" aria-hidden />
            {t.tasks.manageSpacesTitle}
          </Button>
        }
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <FilterSidebarMobileBar
          title={mobileNavTitle}
          onOpen={() => setFiltersOpen(true)}
          openButtonAriaLabel={t.tasks.openSpacesNav}
          endSlot={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={openManageSpaces}
              aria-label={t.tasks.manageSpacesTitle}
            >
              <Settings2 className="size-4" aria-hidden />
            </Button>
          }
        />

        {!isStoreHydrated ? (
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-6">
            {activeSpaceId ? (
              <TasksViewSkeleton viewMode={viewMode} />
            ) : (
              <div className="space-y-4">
                <div className="h-40 animate-pulse rounded-lg bg-muted/40" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
                  <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
                </div>
              </div>
            )}
          </div>
        ) : activeNav === TASKS_DASHBOARD_NAV_ID ? (
          <div className="min-h-0 min-w-0 flex-1 overflow-auto px-6 py-6">
            {userVisibleSpaces(store.spaces).length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Folder />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">{t.tasks.dashboardEmptyTitle}</EmptyTitle>
                  <EmptyDescription>{t.tasks.dashboardEmptyBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button type="button" onClick={openCreateSpaceFromDashboard}>
                    {t.tasks.dashboardEmptyCta}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <TasksDashboard schema={userVisibleTasksSchema(store)} />
            )}
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-6">
            <div className="shrink-0">
              <AppListToolbar<TasksViewMode>
                totalLabel={t.tasks.totalLabel.replace("{count}", String(searchFilteredTasks.length))}
                viewModes={[
                  { id: "kanban", icon: LayoutGrid, ariaLabel: t.tasks.viewKanban },
                  { id: "list", icon: List, ariaLabel: t.tasks.viewList },
                  { id: "calendar", icon: Calendar, ariaLabel: t.tasks.viewCalendar },
                ]}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                addButtonLabel={t.tasks.addTask}
                onAdd={openCreateTask}
                search={{
                  value: taskSearch,
                  onChange: setTaskSearch,
                  placeholder: t.tasks.searchPlaceholder,
                  "aria-label": t.tasks.searchAriaLabel,
                }}
                searchTrailing={
                  <>
                    <Switch id="tasks-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                    <Label htmlFor="tasks-archived" className="text-sm text-muted-foreground whitespace-nowrap">
                      {showArchived ? t.tasks.hideArchived : t.tasks.showArchived}
                    </Label>
                  </>
                }
              />
            </div>

            <div
              className={
                viewMode === "kanban"
                  ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden"
                  : "min-h-0 flex-1 overflow-hidden"
              }
            >
              {spaceTasksRaw.length === 0 ? (
                <Empty className="border border-border p-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Folder />
                    </EmptyMedia>
                    <EmptyTitle className="text-xl font-semibold text-foreground">
                      {t.tasks.emptySpaceTitle}
                    </EmptyTitle>
                    <EmptyDescription>{t.tasks.emptySpaceBody}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={openCreateTask}>{t.tasks.addTask}</Button>
                  </EmptyContent>
                </Empty>
              ) : searchFilteredTasks.length === 0 && taskSearch.trim() ? (
                <ListSearchEmptyState
                  labels={{
                    title: t.tasks.emptySearchTitle,
                    body: t.tasks.emptySearchBody,
                    clear: t.tasks.searchClear,
                  }}
                  onClear={() => setTaskSearch("")}
                />
              ) : (
                <TasksView
                  viewMode={viewMode}
                  spaceId={activeSpaceId!}
                  tasks={searchFilteredTasks}
                  allTasks={store.tasks}
                  highlightTaskId={highlightTaskId}
                  onTasksReplace={handleTasksReplace}
                  columnTitles={columnTitles}
                  cardLabels={cardLabels}
                  listLabels={listLabels}
                  statusLabel={statusLabel}
                  localeTag={getIntlLocaleTag(locale)}
                  locale={locale}
                  calendarMonth={calendarMonth}
                  onCalendarMonthChange={setCalendarMonth}
                  onSwitchToListView={() => handleViewModeChange("list")}
                  onEdit={openEditTask}
                  onDelete={(task) => setTaskPendingDelete(task)}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onArchiveAllDone={requestArchiveAllDone}
                  doneColumnMenuLabels={{
                    menuAriaLabel: t.tasks.doneColumnMenuAria,
                    archiveAllLabel: t.tasks.archiveAll,
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={taskPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setTaskPendingDelete(null);
        }}
        title={t.tasks.deleteTaskTitle}
        description={deleteTaskDescription}
        itemLabel={taskPendingDelete?.title ?? ""}
        cancelLabel={t.tasks.deleteCancel}
        confirmLabel={t.tasks.deleteConfirm}
        onConfirm={confirmDeleteTask}
      />
      <ConfirmDeleteAlertDialog
        open={spacePendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setSpacePendingDelete(null);
        }}
        title={t.tasks.deleteSpaceTitle}
        description={t.tasks.deleteSpaceDescription}
        itemLabel={spacePendingDelete?.name ?? ""}
        cancelLabel={t.tasks.deleteCancel}
        confirmLabel={t.tasks.deleteConfirm}
        onConfirm={confirmDeleteSpace}
      />
      <ConfirmDeleteAlertDialog
        open={commentPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setCommentPendingDelete(null);
        }}
        title={t.tasks.deleteCommentTitle}
        description={t.tasks.deleteCommentDescription}
        itemLabel=" "
        cancelLabel={t.tasks.deleteCancel}
        confirmLabel={t.tasks.deleteConfirm}
        onConfirm={confirmDeleteComment}
      />
      <AlertDialog
        open={archiveAllConfirmCount != null}
        onOpenChange={(open) => {
          if (!open) setArchiveAllConfirmCount(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.tasks.archiveAllConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.tasks.archiveAllConfirmDescription.replace(
                "{count}",
                String(archiveAllConfirmCount ?? 0)
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.tasks.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmArchiveAllDone()}>
              {t.tasks.archiveAllConfirmAction}
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
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                resolveCreateCalendarConfirm(true);
              }}
            >
              {t.googleCalendar.confirmCreateCalendarConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {kanbanSpaceDnD ? (
        <TasksKanbanDndProvider
          spaceId={activeSpaceId!}
          allTasks={store.tasks}
          onTasksReplace={handleTasksReplace}
          onMovedToSpace={handleTaskMovedToSpace}
          onDragStart={() => {
            setTaskKanbanDragging(true);
            if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
              setFiltersOpen(true);
            }
          }}
          onDragEnd={() => setTaskKanbanDragging(false)}
          cardLabels={cardLabels}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-row">{tasksWorkspace}</div>
        </TasksKanbanDndProvider>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-row">{tasksWorkspace}</div>
      )}

      <ManageSpacesSheet
        open={manageSheetOpen}
        onOpenChange={setManageSheetOpen}
        spaces={spacesSorted}
        onAddSpace={openAddSpaceFromManage}
        onRenameSpace={openRenameSpaceFromManage}
        onDeleteSpace={(space) => {
          requestDeleteSpace(space);
          setManageSheetOpen(false);
        }}
      />

      <DeleteSpaceWithTasksDialog
        key={spaceDeleteWithTasks?.id ?? "closed"}
        open={spaceDeleteWithTasks != null}
        space={spaceDeleteWithTasks}
        otherSpaces={userVisibleSpaces(store.spaces)}
        taskCount={
          spaceDeleteWithTasks
            ? store.tasks.filter((x) => x.space_id === spaceDeleteWithTasks.id).length
            : 0
        }
        onOpenChange={(open) => {
          if (!open) setSpaceDeleteWithTasks(null);
        }}
        onMoveAndDelete={confirmDeleteSpaceMoveTasks}
        onDeleteAllTasks={confirmDeleteSpaceAndAllTasks}
      />

      <AddSpaceSheet
        open={spaceSheetOpen}
        editingSpace={editingSpace}
        onClose={closeSpaceSheet}
        onSubmit={handleSpaceSubmit}
      />

      <AddTaskSheet
        open={taskSheetOpen}
        editingItem={editingTaskLive}
        spaces={spacesSorted}
        defaultSpaceId={activeSpaceId ?? spacesSorted[0]?.id ?? ""}
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
    </div>
  );
}

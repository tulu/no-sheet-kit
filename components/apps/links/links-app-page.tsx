"use client";

import {
  CheckCircle2,
  Circle,
  CalendarClock,
  Hash,
  LayoutGrid,
  Link2,
  List,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
import type { GoogleCalendarSubmitPrefs } from "@/components/common/google-calendar-event-options";
import { ConfirmDeleteAlertDialog } from "@/components/common/confirm-delete-alert-dialog";
import {
  type FilterSidebarItem,
  FilterSidebarDesktopAside,
  FilterSidebarMobileBar,
  FilterSidebarMobileSheet,
} from "@/components/common/filter-sidebar";
import { useI18n } from "@/components/providers/i18n-provider";
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
import { appCrudToast } from "@/lib/app-toasts";
import {
  createEmptyNSKLinksSchema,
  LINKS_VIEW_MODES,
  type LinkFilterId,
  type LinksViewMode,
  type NSKLinkItem,
} from "@/lib/links/schema";
import {
  decodeTagFilter,
  encodeTagFilter,
  itemHasTag,
  linkMatchesSearch,
  tagsWithCount,
} from "@/lib/links/links-helpers";
import { readNSKLinksStorage, writeNSKLinksStorage } from "@/lib/links/storage";
import { buildLinkCalendarCopy } from "@/lib/google/calendar-event-copy";
import { buildAllDayNskEventInput } from "@/lib/google/calendar-event-body";
import {
  nskCalendarCreateEvent,
  nskCalendarDeleteEvent,
  nskCalendarGetNoSheetKitCalendarId,
  nskCalendarPatchEvent,
} from "@/lib/google/calendar-sync-client";
import type { NskCalendarEventInput } from "@/lib/google/google-calendar";
import { useAppsSessionKind, useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import { ListSearchEmptyState } from "@/components/common/list-search-empty";
import { AddLinkSheet } from "./add-link-sheet";
import { LinksView } from "./links-view";
import { LinksViewSkeleton } from "./links-view-skeleton";

type EnrichResponse = {
  url: string;
  canonical_url?: string;
  site_origin?: string;
  hostname?: string;
  title?: string;
  description?: string;
  image_url?: string;
  favicon_url?: string;
  auto_tags: string[];
};

const LINK_FILTER_ICONS: Record<LinkFilterId, LucideIcon> = {
  all: Tags,
  tags: Hash,
};

const LINK_FILTER_REVIEWED = "reviewed";
const LINK_FILTER_NOT_REVIEWED = "not_reviewed";
const LINK_FILTER_DUE_30 = "review_due_30";

function parseLocalDateOnly(isoDate: string | undefined): Date | null {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function isReviewDueWithinDays(item: NSKLinkItem, days: number): boolean {
  if (item.reviewed) return false;
  const due = parseLocalDateOnly(item.review_due_date);
  if (!due) return false;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return due.getTime() >= start.getTime() && due.getTime() <= end.getTime();
}

function buildFilterItems(
  labels: { all: string; reviewed: string; notReviewed: string; dueSoon: string },
  allCount: number,
  tagCounts: { tag: string; count: number }[],
  reviewedCount: number,
  notReviewedCount: number,
  dueSoonCount: number
): FilterSidebarItem<string>[] {
  const out: FilterSidebarItem<string>[] = [
    { id: "all", label: labels.all, icon: LINK_FILTER_ICONS.all, count: allCount },
  ];
  if (tagCounts.length > 0) {
    for (const row of tagCounts) {
      out.push({
        id: encodeTagFilter(row.tag),
        label: row.tag,
        icon: LINK_FILTER_ICONS.tags,
        count: row.count,
        dividerBefore: out.length === 1,
      });
    }
  }
  out.push(
    {
      id: LINK_FILTER_REVIEWED,
      label: labels.reviewed,
      icon: CheckCircle2,
      count: reviewedCount,
      dividerBefore: true,
    },
    {
      id: LINK_FILTER_NOT_REVIEWED,
      label: labels.notReviewed,
      icon: Circle,
      count: notReviewedCount,
    },
    {
      id: LINK_FILTER_DUE_30,
      label: labels.dueSoon,
      icon: CalendarClock,
      count: dueSoonCount,
      tone: "accent",
    }
  );
  return out;
}

export function LinksAppPage() {
  const sessionSuffix = useSessionStorageSuffix();
  const sessionKind = useAppsSessionKind();
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<LinksViewMode>("grid");
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [store, setStore] = useState(createEmptyNSKLinksSchema);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NSKLinkItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<NSKLinkItem | null>(null);
  const [linkSearch, setLinkSearch] = useState("");
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

  useAppLocalHydration(() => readNSKLinksStorage(sessionSuffix), setStore, setIsStoreHydrated, {
    appViewKey: "links",
    validModes: LINKS_VIEW_MODES,
    defaultView: "grid",
    setViewMode,
  });

  const allCount = store.items.length;
  /** Tags with a single link are hidden from the sidebar (no useful filter). */
  const tagCounts = tagsWithCount(store.items).filter((row) => row.count > 1);
  const reviewedCount = store.items.filter((item) => item.reviewed).length;
  const notReviewedCount = allCount - reviewedCount;
  const dueSoonCount = store.items.filter((item) => isReviewDueWithinDays(item, 30)).length;
  const activeTag =
    activeFilter !== LINK_FILTER_REVIEWED &&
    activeFilter !== LINK_FILTER_NOT_REVIEWED &&
    activeFilter !== LINK_FILTER_DUE_30
      ? decodeTagFilter(activeFilter)
      : null;
  const filteredItems = store.items.filter((item) => {
    if (activeFilter === LINK_FILTER_REVIEWED) return item.reviewed;
    if (activeFilter === LINK_FILTER_NOT_REVIEWED) return !item.reviewed;
    if (activeFilter === LINK_FILTER_DUE_30) return isReviewDueWithinDays(item, 30);
    if (activeTag) return itemHasTag(item, activeTag);
    return true;
  });
  const searchFilteredItems = filterItemsBySearch(filteredItems, linkSearch, linkMatchesSearch);
  const sortedItems = [...searchFilteredItems].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const sidebarItems = buildFilterItems(
    t.links.filters,
    allCount,
    tagCounts,
    reviewedCount,
    notReviewedCount,
    dueSoonCount
  );

  function updateStoreItems(mutator: (items: NSKLinkItem[]) => NSKLinkItem[]) {
    setStore((prev) => {
      const nextStore = { ...prev, items: mutator(prev.items) };
      writeNSKLinksStorage(sessionSuffix, nextStore);
      return nextStore;
    });
  }

  async function enrichLink(itemId: string, url: string): Promise<void> {
    try {
      const response = await fetch("/api/links/enrich", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as EnrichResponse | { error?: string };
      const now = new Date().toISOString();
      if (!response.ok || !("url" in data)) {
        const errorMessage = "error" in data && data.error ? data.error : t.links.errors.enrichFailed;
        updateStoreItems((items) =>
          items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: "error",
                  error_message: errorMessage,
                  updated_at: now,
                }
              : item
          )
        );
        return;
      }
        updateStoreItems((items) =>
          items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                url: data.url,
                canonical_url: data.canonical_url,
                site_origin: data.site_origin,
                hostname: data.hostname,
                title: data.title,
                description: data.description,
                image_url: data.image_url,
                favicon_url: data.favicon_url,
                auto_tags: data.auto_tags ?? [],
                status: "ready",
                error_message: undefined,
                updated_at: now,
              }
            : item
        )
      );
    } catch {
      const now = new Date().toISOString();
      updateStoreItems((items) =>
        items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "error",
                error_message: t.links.errors.enrichFailed,
                updated_at: now,
              }
            : item
        )
      );
    }
  }

  async function handleDisconnectLinkCalendar() {
    if (!editingItem?.google_calendar_event_id) return;
    await nskCalendarDeleteEvent(editingItem.google_calendar_event_id);
    setEditingItem({
      ...editingItem,
      google_calendar_event_id: undefined,
      google_calendar_email_reminder_minutes: undefined,
    });
  }

  async function handleCreateOrUpdate(
    values: {
      url: string;
      manualTags: string[];
      reviewed: boolean;
      reviewDueDate?: string;
    },
    calendar: GoogleCalendarSubmitPrefs
  ) {
    const now = new Date().toISOString();
    if (!editingItem) {
      let newItem: NSKLinkItem = {
        id: crypto.randomUUID(),
        url: values.url,
        manual_tags: values.manualTags,
        auto_tags: [],
        reviewed: values.reviewed,
        reviewed_at: values.reviewed ? now : undefined,
        review_due_date: values.reviewDueDate,
        status: "pending",
        created_at: now,
        updated_at: now,
      };
      if (sessionKind === "google" && calendar.enabled && values.reviewDueDate) {
        const calendarId = await nskCalendarGetNoSheetKitCalendarId();
        if (calendarId === null) {
          const accepted = await requestCreateCalendarConfirm();
          if (!accepted) return;
        }
        const { summary, description } = buildLinkCalendarCopy({
          item: {
            url: newItem.url,
            title: newItem.title,
            hostname: newItem.hostname,
            review_due_date: values.reviewDueDate,
          },
          t,
          locale,
        });
        const body = buildAllDayNskEventInput({
          summary,
          description,
          startDateYmd: values.reviewDueDate,
          reminderEmailMinutes: calendar.reminderMinutes,
        });
        const created = await nskCalendarCreateEvent(body);
        if (created) {
          newItem = {
            ...newItem,
            google_calendar_event_id: created.id,
            google_calendar_email_reminder_minutes: calendar.reminderMinutes,
          };
        } else {
          toast.error(t.googleCalendar.syncError);
        }
      }
      updateStoreItems((items) => [...items, newItem]);
      appCrudToast(t, "links", "created");
      setSheetOpen(false);
      void enrichLink(newItem.id, values.url);
      return;
    }

    const editingId = editingItem.id;
    const previousUrl = editingItem.url;

    let merged: NSKLinkItem = {
      ...editingItem,
      url: values.url,
      manual_tags: values.manualTags,
      reviewed: values.reviewed,
      reviewed_at: values.reviewed ? editingItem.reviewed_at ?? now : undefined,
      review_due_date: values.reviewDueDate,
      status: values.url !== previousUrl ? "pending" : editingItem.status,
      updated_at: now,
    };

    if (merged.google_calendar_event_id && !values.reviewDueDate) {
      await nskCalendarDeleteEvent(merged.google_calendar_event_id);
      merged = {
        ...merged,
        google_calendar_event_id: undefined,
        google_calendar_email_reminder_minutes: undefined,
      };
    }

    if (sessionKind === "google" && values.reviewDueDate && calendar.enabled) {
      if (merged.google_calendar_event_id) {
        const { summary, description } = buildLinkCalendarCopy({
          item: merged,
          t,
          locale,
        });
        const body = buildAllDayNskEventInput({
          summary,
          description,
          startDateYmd: values.reviewDueDate,
          reminderEmailMinutes:
            merged.google_calendar_email_reminder_minutes ?? calendar.reminderMinutes,
        });
        const patchBody: Partial<NskCalendarEventInput> = {
          summary: body.summary,
          description: body.description,
          start: body.start,
          end: body.end,
          reminders: body.reminders,
        };
        const ok = await nskCalendarPatchEvent(merged.google_calendar_event_id, patchBody);
        if (!ok) toast.error(t.googleCalendar.syncError);
      } else {
        const calendarId = await nskCalendarGetNoSheetKitCalendarId();
        if (calendarId === null) {
          const accepted = await requestCreateCalendarConfirm();
          if (!accepted) return;
        }
        const { summary, description } = buildLinkCalendarCopy({
          item: merged,
          t,
          locale,
        });
        const body = buildAllDayNskEventInput({
          summary,
          description,
          startDateYmd: values.reviewDueDate,
          reminderEmailMinutes: calendar.reminderMinutes,
        });
        const created = await nskCalendarCreateEvent(body);
        if (created) {
          merged = {
            ...merged,
            google_calendar_event_id: created.id,
            google_calendar_email_reminder_minutes: calendar.reminderMinutes,
          };
        } else {
          toast.error(t.googleCalendar.syncError);
        }
      }
    }

    updateStoreItems((items) => items.map((item) => (item.id === editingId ? merged : item)));
    appCrudToast(t, "links", "updated");
    setSheetOpen(false);
    setEditingItem(null);
    if (values.url !== previousUrl) {
      void enrichLink(editingId, values.url);
    }
  }

  function openCreateSheet() {
    setEditingItem(null);
    setSheetOpen(true);
  }

  function openEditSheet(item: NSKLinkItem) {
    setEditingItem(item);
    setSheetOpen(true);
  }

  function handleRequestDelete(item: NSKLinkItem) {
    setItemPendingDelete(item);
  }

  async function handleConfirmDelete() {
    if (!itemPendingDelete) return;
    const ev = itemPendingDelete.google_calendar_event_id;
    if (ev) {
      await nskCalendarDeleteEvent(ev);
    }
    updateStoreItems((items) => items.filter((item) => item.id !== itemPendingDelete.id));
    appCrudToast(t, "links", "deleted");
    setItemPendingDelete(null);
  }

  function handleToggleReviewed(item: NSKLinkItem, next: boolean) {
    const now = new Date().toISOString();
    updateStoreItems((items) =>
      items.map((x) =>
        x.id === item.id
          ? {
              ...x,
              reviewed: next,
              reviewed_at: next ? now : undefined,
              updated_at: now,
            }
          : x
      )
    );
  }

  function handleViewModeChange(next: LinksViewMode) {
    setViewMode(next);
    persistAppViewBundle("links", next);
  }

  function handleRefreshMetadata(item: NSKLinkItem) {
    const now = new Date().toISOString();
    updateStoreItems((items) =>
      items.map((x) =>
        x.id === item.id ? { ...x, status: "pending", error_message: undefined, updated_at: now } : x
      )
    );
    void enrichLink(item.id, item.url);
  }

  const deleteLinkDescription = itemPendingDelete?.google_calendar_event_id
    ? `${t.links.deleteDialogDescription}\n\n${t.googleCalendar.deleteItemAlsoDeletesEvent}`
    : t.links.deleteDialogDescription;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={itemPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setItemPendingDelete(null);
        }}
        title={t.links.deleteDialogTitle}
        description={deleteLinkDescription}
        itemLabel={itemPendingDelete?.title ?? itemPendingDelete?.url ?? null}
        cancelLabel={t.links.deleteDialogCancel}
        confirmLabel={t.links.deleteDialogConfirm}
        onConfirm={handleConfirmDelete}
      />
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <FilterSidebarDesktopAside<string>
          title={t.links.sidebarTitle}
          items={sidebarItems}
          activeId={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <FilterSidebarMobileSheet<string>
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title={t.links.sidebarTitle}
          items={sidebarItems}
          activeId={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <FilterSidebarMobileBar
            title={t.links.sidebarTitle}
            onOpen={() => setFiltersOpen(true)}
            openButtonAriaLabel={t.links.openFiltersNav}
          />

          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            <AppListToolbar<LinksViewMode>
              totalLabel={t.links.totalLabel.replace("{count}", String(searchFilteredItems.length))}
              viewModes={[
                { id: "grid", icon: LayoutGrid, ariaLabel: t.links.viewGrid },
                { id: "list", icon: List, ariaLabel: t.links.viewList },
              ]}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              addButtonLabel={t.links.addNew}
              onAdd={openCreateSheet}
              search={{
                value: linkSearch,
                onChange: setLinkSearch,
                placeholder: t.links.searchPlaceholder,
                "aria-label": t.links.searchAriaLabel,
              }}
            />

            {!isStoreHydrated ? (
              <LinksViewSkeleton viewMode={viewMode} />
            ) : store.items.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Link2 />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.links.emptyTitle}
                  </EmptyTitle>
                  <EmptyDescription>{t.links.emptyBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={openCreateSheet}>{t.links.addNew}</Button>
                </EmptyContent>
              </Empty>
            ) : sortedItems.length === 0 && linkSearch.trim() ? (
              <ListSearchEmptyState
                labels={{
                  title: t.links.searchEmptyTitle,
                  body: t.links.searchEmptyBody,
                  clear: t.links.searchClear,
                }}
                onClear={() => setLinkSearch("")}
              />
            ) : sortedItems.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Link2 />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.links.searchEmptyTitle}
                  </EmptyTitle>
                  <EmptyDescription>{t.links.searchEmptyBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button type="button" variant="outline" onClick={() => setActiveFilter("all")}>
                    {t.links.filters.all}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <LinksView
                items={sortedItems}
                viewMode={viewMode}
                locale={locale}
                onEdit={openEditSheet}
                onDelete={handleRequestDelete}
                onToggleReviewed={handleToggleReviewed}
                onRefreshMetadata={handleRefreshMetadata}
              />
            )}
          </div>
        </div>
      </div>

      <AddLinkSheet
        open={sheetOpen}
        editingItem={editingItem}
        onClose={() => {
          setSheetOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
        onDisconnectGoogleCalendar={handleDisconnectLinkCalendar}
      />
    </div>
  );
}

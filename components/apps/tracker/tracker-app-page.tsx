"use client";

import { Activity, Calendar, LayoutGrid, List, Plus, Settings2 } from "lucide-react";
import { startOfMonth } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
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
import { appCrudToast, appTrackerTrackToast } from "@/lib/app-toasts";
import {
  createEmptyNSKTrackerSchema,
  TRACKER_VIEW_MODES,
  type NSKTrackerEntry,
  type NSKTrackerSchema,
  type NSKTrackerTrack,
  type TrackerViewMode,
} from "@/lib/tracker/schema";
import { readNSKTrackerStorage, writeNSKTrackerStorage } from "@/lib/tracker/storage";
import {
  entriesInTrack,
  entryMatchesSearch,
  formatTrackerDateLong,
  sortEntriesForDisplay,
  sortTracks,
} from "@/lib/tracker/tracker-helpers";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import { AddEntrySheet } from "./add-entry-sheet";
import { AddTrackSheet } from "./add-track-sheet";
import { DeleteTrackWithEntriesDialog } from "./delete-track-with-entries-dialog";
import { ManageTracksSheet } from "./manage-tracks-sheet";
import { TrackerView } from "./tracker-view";
import { TrackerViewSkeleton } from "./tracker-view-skeleton";

export function TrackerAppPage() {
  const sessionSuffix = useSessionStorageSuffix();
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TrackerViewMode>("grid");
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [store, setStore] = useState<NSKTrackerSchema>(createEmptyNSKTrackerSchema);
  const [entrySearch, setEntrySearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));

  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [trackSheetOpen, setTrackSheetOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<NSKTrackerTrack | null>(null);
  const [trackDeleteWithEntries, setTrackDeleteWithEntries] = useState<NSKTrackerTrack | null>(
    null
  );

  const [entrySheetOpen, setEntrySheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NSKTrackerEntry | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] = useState<NSKTrackerEntry | null>(null);

  function commit(updater: (prev: NSKTrackerSchema) => NSKTrackerSchema) {
    setStore((prev) => {
      const next = updater(prev);
      writeNSKTrackerStorage(sessionSuffix, next);
      return next;
    });
  }

  useAppLocalHydration(() => readNSKTrackerStorage(sessionSuffix), setStore, setIsStoreHydrated, {
    appViewKey: "tracker",
    validModes: TRACKER_VIEW_MODES,
    defaultView: "grid",
    setViewMode,
  });

  const tracksSorted = useMemo(() => sortTracks(store.tracks), [store.tracks]);

  const activeTrack = useMemo(
    () => (activeTrackId ? store.tracks.find((tr) => tr.id === activeTrackId) ?? null : null),
    [activeTrackId, store.tracks]
  );

  const syncTrackerUrl = useCallback(
    (trackId: string | null) => {
      const p = new URLSearchParams(searchParams.toString());
      if (trackId) {
        p.set("track", trackId);
      } else {
        p.delete("track");
      }
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleTrackChange = useCallback(
    (trackId: string) => {
      setActiveTrackId(trackId);
      syncTrackerUrl(trackId);
    },
    [syncTrackerUrl]
  );

  useEffect(() => {
    if (!isStoreHydrated) return;
    const raf = requestAnimationFrame(() => {
      const trackParam = searchParams.get("track");
      if (trackParam && store.tracks.some((tr) => tr.id === trackParam)) {
        setActiveTrackId(trackParam);
        return;
      }
      if (tracksSorted.length > 0) {
        const fallback = tracksSorted[0]!.id;
        setActiveTrackId(fallback);
        if (trackParam !== fallback) {
          syncTrackerUrl(fallback);
        }
      } else {
        setActiveTrackId(null);
        if (trackParam) syncTrackerUrl(null);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [isStoreHydrated, searchParams, store.tracks, tracksSorted, syncTrackerUrl]);

  function handleViewModeChange(next: TrackerViewMode) {
    setViewMode(next);
    persistAppViewBundle("tracker", next);
    if (next === "calendar") {
      setCalendarMonth(startOfMonth(new Date()));
    }
  }

  const sidebarItems: FilterSidebarItem<string>[] = tracksSorted.map((tr) => ({
    id: tr.id,
    label: tr.name,
    icon: Activity,
    count: entriesInTrack(store.entries, tr.id).length,
  }));

  const trackEntries = activeTrackId ? entriesInTrack(store.entries, activeTrackId) : [];
  const searchFilteredEntries = filterItemsBySearch(trackEntries, entrySearch, entryMatchesSearch);
  const sortedEntries = sortEntriesForDisplay(searchFilteredEntries);

  const mobileNavTitle = activeTrack?.name ?? t.tracker.sidebarTitle;

  function openCreateTrack() {
    setEditingTrack(null);
    setTrackSheetOpen(true);
  }

  function openRenameTrack(track: NSKTrackerTrack) {
    setEditingTrack(track);
    setTrackSheetOpen(true);
    setManageSheetOpen(false);
  }

  function openDeleteTrackDialog(track: NSKTrackerTrack) {
    const count = entriesInTrack(store.entries, track.id).length;
    if (count === 0) {
      commit((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((tr) => tr.id !== track.id),
      }));
      appTrackerTrackToast(t, "deleted");
      if (activeTrackId === track.id) {
        const remaining = sortTracks(store.tracks.filter((tr) => tr.id !== track.id));
        const nextId = remaining[0]?.id ?? null;
        setActiveTrackId(nextId);
        syncTrackerUrl(nextId);
      }
      return;
    }
    setTrackDeleteWithEntries(track);
    setManageSheetOpen(false);
  }

  function handleSaveTrack(name: string) {
    const now = new Date().toISOString();
    if (editingTrack) {
      commit((prev) => ({
        ...prev,
        tracks: prev.tracks.map((tr) =>
          tr.id === editingTrack.id ? { ...tr, name, updated_at: now } : tr
        ),
      }));
      appTrackerTrackToast(t, "updated");
    } else {
      const maxOrder = Math.max(-1, ...store.tracks.map((tr) => tr.order));
      const id = crypto.randomUUID();
      const row: NSKTrackerTrack = {
        id,
        name,
        order: maxOrder + 1,
        created_at: now,
        updated_at: now,
      };
      commit((prev) => ({ ...prev, tracks: [...prev.tracks, row] }));
      appTrackerTrackToast(t, "created");
      setActiveTrackId(id);
      syncTrackerUrl(id);
    }
    setTrackSheetOpen(false);
    setEditingTrack(null);
  }

  function confirmDeleteTrackMoveEntries(targetTrackId: string) {
    if (!trackDeleteWithEntries) return;
    const cid = trackDeleteWithEntries.id;
    const now = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((tr) => tr.id !== cid),
      entries: prev.entries.map((e) =>
        e.track_id === cid ? { ...e, track_id: targetTrackId, updated_at: now } : e
      ),
    }));
    appTrackerTrackToast(t, "deleted");
    if (activeTrackId === cid) {
      setActiveTrackId(targetTrackId);
      syncTrackerUrl(targetTrackId);
    }
    setTrackDeleteWithEntries(null);
  }

  function confirmDeleteTrackAndAllEntries() {
    if (!trackDeleteWithEntries) return;
    const cid = trackDeleteWithEntries.id;
    commit((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((tr) => tr.id !== cid),
      entries: prev.entries.filter((e) => e.track_id !== cid),
    }));
    appTrackerTrackToast(t, "deleted");
    if (activeTrackId === cid) {
      const remaining = sortTracks(store.tracks.filter((tr) => tr.id !== cid));
      const nextId = remaining[0]?.id ?? null;
      setActiveTrackId(nextId);
      syncTrackerUrl(nextId);
    }
    setTrackDeleteWithEntries(null);
  }

  function openCreateEntry() {
    if (!activeTrackId) return;
    setEditingEntry(null);
    setEntrySheetOpen(true);
  }

  function openEditEntry(entry: NSKTrackerEntry) {
    setEditingEntry(entry);
    setEntrySheetOpen(true);
  }

  function handleSaveEntry(values: {
    occurred_on: string;
    outcome_id: NSKTrackerEntry["outcome_id"];
    start_time: string;
    end_time: string;
    notes: string;
  }) {
    if (!activeTrackId && !editingEntry) return;
    const now = new Date().toISOString();
    const startTime = values.start_time || undefined;
    const endTime = values.end_time || undefined;
    const notes = values.notes || undefined;

    if (editingEntry) {
      commit((prev) => ({
        ...prev,
        entries: prev.entries.map((e) =>
          e.id === editingEntry.id
            ? {
                ...e,
                occurred_on: values.occurred_on,
                outcome_id: values.outcome_id,
                start_time: startTime,
                end_time: endTime,
                notes,
                updated_at: now,
              }
            : e
        ),
      }));
      appCrudToast(t, "tracker", "updated");
    } else {
      const row: NSKTrackerEntry = {
        id: crypto.randomUUID(),
        track_id: activeTrackId!,
        occurred_on: values.occurred_on,
        outcome_id: values.outcome_id,
        start_time: startTime,
        end_time: endTime,
        notes,
        created_at: now,
        updated_at: now,
      };
      commit((prev) => ({ ...prev, entries: [...prev.entries, row] }));
      appCrudToast(t, "tracker", "created");
    }
    setEntrySheetOpen(false);
    setEditingEntry(null);
  }

  function confirmDeleteEntry() {
    if (!entryPendingDelete) return;
    commit((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== entryPendingDelete.id),
    }));
    appCrudToast(t, "tracker", "deleted");
    setEntryPendingDelete(null);
  }

  const deleteEntryDescription = t.tracker.deleteEntryDescription;
  const deleteEntryLabel = entryPendingDelete
    ? formatTrackerDateLong(entryPendingDelete.occurred_on, locale)
    : null;

  const manageFooter = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full gap-2"
      onClick={() => setManageSheetOpen(true)}
    >
      <Settings2 className="size-4 shrink-0" aria-hidden />
      {t.tracker.manageTracksTitle}
    </Button>
  );

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={entryPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setEntryPendingDelete(null);
        }}
        title={t.tracker.deleteEntryTitle}
        description={deleteEntryDescription}
        itemLabel={deleteEntryLabel}
        cancelLabel={t.tracker.deleteCancel}
        confirmLabel={t.tracker.deleteConfirm}
        onConfirm={confirmDeleteEntry}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        {tracksSorted.length > 0 ? (
          <>
            <FilterSidebarDesktopAside<string>
              title={t.tracker.sidebarTitle}
              items={sidebarItems}
              activeId={activeTrackId ?? ""}
              onFilterChange={handleTrackChange}
              footer={manageFooter}
            />
            <FilterSidebarMobileSheet<string>
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              title={t.tracker.sidebarTitle}
              items={sidebarItems}
              activeId={activeTrackId ?? ""}
              onFilterChange={(id) => {
                handleTrackChange(id);
                setFiltersOpen(false);
              }}
              footer={manageFooter}
            />
          </>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {tracksSorted.length > 0 ? (
            <FilterSidebarMobileBar
              title={mobileNavTitle}
              onOpen={() => setFiltersOpen(true)}
              openButtonAriaLabel={t.tracker.openTracksNav}
              endSlot={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setManageSheetOpen(true)}
                  aria-label={t.tracker.manageTracksTitle}
                >
                  <Settings2 className="size-4" aria-hidden />
                </Button>
              }
            />
          ) : null}

          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            {!isStoreHydrated ? (
              <TrackerViewSkeleton viewMode={viewMode} />
            ) : tracksSorted.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Activity />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.tracker.emptyTracksTitle}
                  </EmptyTitle>
                  <EmptyDescription>{t.tracker.emptyTracksBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={openCreateTrack}>
                    <Plus className="mr-1 size-4" aria-hidden />
                    {t.tracker.addTrack}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : activeTrack ? (
              <>
                <AppListToolbar<TrackerViewMode>
                  totalLabel={t.tracker.totalLabel.replace("{count}", String(sortedEntries.length))}
                  viewModes={[
                    { id: "grid", icon: LayoutGrid, ariaLabel: t.tracker.viewGrid },
                    { id: "list", icon: List, ariaLabel: t.tracker.viewList },
                    { id: "calendar", icon: Calendar, ariaLabel: t.tracker.viewCalendar },
                  ]}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  addButtonLabel={t.tracker.addEntry}
                  onAdd={openCreateEntry}
                  search={{
                    value: entrySearch,
                    onChange: setEntrySearch,
                    placeholder: t.tracker.searchPlaceholder,
                    "aria-label": t.tracker.searchAriaLabel,
                  }}
                />

                {trackEntries.length === 0 ? (
                  <Empty className="mt-6 border border-border p-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Activity />
                      </EmptyMedia>
                      <EmptyTitle className="text-xl font-semibold text-foreground">
                        {t.tracker.emptyTrackTitle}
                      </EmptyTitle>
                      <EmptyDescription>{t.tracker.emptyTrackBody}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button onClick={openCreateEntry}>{t.tracker.addEntry}</Button>
                    </EmptyContent>
                  </Empty>
                ) : sortedEntries.length === 0 && entrySearch.trim() ? (
                  <ListSearchEmptyState
                    labels={{
                      title: t.tracker.emptySearchTitle,
                      body: t.tracker.emptySearchBody,
                      clear: t.tracker.searchClear,
                    }}
                    onClear={() => setEntrySearch("")}
                  />
                ) : (
                  <TrackerView
                    entries={sortedEntries}
                    viewMode={viewMode}
                    locale={locale}
                    calendarMonth={calendarMonth}
                    onCalendarMonthChange={setCalendarMonth}
                    onEdit={openEditEntry}
                    onDelete={setEntryPendingDelete}
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <AddTrackSheet
        open={trackSheetOpen}
        editingTrack={editingTrack}
        onClose={() => {
          setTrackSheetOpen(false);
          setEditingTrack(null);
        }}
        onSubmit={handleSaveTrack}
      />

      <ManageTracksSheet
        open={manageSheetOpen}
        onOpenChange={setManageSheetOpen}
        tracks={tracksSorted}
        onAddTrack={() => {
          setManageSheetOpen(false);
          openCreateTrack();
        }}
        onRenameTrack={openRenameTrack}
        onDeleteTrack={openDeleteTrackDialog}
      />

      <DeleteTrackWithEntriesDialog
        open={trackDeleteWithEntries != null}
        track={trackDeleteWithEntries}
        otherTracks={tracksSorted}
        entryCount={
          trackDeleteWithEntries
            ? entriesInTrack(store.entries, trackDeleteWithEntries.id).length
            : 0
        }
        onOpenChange={(open) => {
          if (!open) setTrackDeleteWithEntries(null);
        }}
        onMoveAndDelete={confirmDeleteTrackMoveEntries}
        onDeleteAllEntries={confirmDeleteTrackAndAllEntries}
      />

      <AddEntrySheet
        open={entrySheetOpen}
        editingEntry={editingEntry}
        onClose={() => {
          setEntrySheetOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleSaveEntry}
      />
    </div>
  );
}

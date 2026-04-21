"use client";

import { startOfMonth } from "date-fns";
import {
  Bell,
  Cake,
  Calendar,
  CalendarClock,
  CalendarRange,
  CalendarX2,
  CircleEllipsis,
  FileText,
  Flag,
  Flower2,
  HeartHandshake,
  LayoutGrid,
  List,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAppLocalHydration } from "@/lib/apps/use-app-local-hydration";
import { filterItemsBySearch } from "@/lib/apps/filter-items-by-search";
import { appCrudToast } from "@/lib/app-toasts";
import {
  createEmptyNSKDatesSchema,
  type DateFilterId,
  DATES_VIEW_MODES,
  type DatesViewMode,
  type NSKDateItem,
} from "@/lib/dates/schema";
import { readNSKDatesStorage, writeNSKDatesStorage } from "@/lib/dates/storage";
import { persistAppViewBundle } from "@/lib/apps/view-persistence";
import { dateMatchesSearch, isUpcomingWithin30Days } from "@/lib/dates/dates-helpers";
import { ConfirmDeleteAlertDialog } from "@/components/common/confirm-delete-alert-dialog";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
import {
  type FilterSidebarItem,
  FilterSidebarDesktopAside,
  FilterSidebarMobileBar,
  FilterSidebarMobileSheet,
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
import { ListSearchEmptyState } from "@/components/common/list-search-empty";
import { AddDateSheet } from "./add-date-sheet";
import { DatesView } from "./dates-view";
import { DatesViewSkeleton } from "./dates-view-skeleton";

const DATE_FILTER_BASE_ORDER: Exclude<DateFilterId, "upcoming_30">[] = [
  "all",
  "birthday",
  "anniversary",
  "reminder",
  "milestone",
  "memorial",
  "document_expiration",
  "other",
];

const DATE_FILTER_ICONS: Record<DateFilterId, LucideIcon> = {
  all: CalendarRange,
  birthday: Cake,
  anniversary: HeartHandshake,
  reminder: Bell,
  milestone: Flag,
  memorial: Flower2,
  document_expiration: FileText,
  other: CircleEllipsis,
  upcoming_30: CalendarClock,
};

function buildDatesFilterItems(
  types: Record<DateFilterId, string>,
  counts: Record<DateFilterId, number>
): FilterSidebarItem<DateFilterId>[] {
  const items: FilterSidebarItem<DateFilterId>[] = DATE_FILTER_BASE_ORDER.map((id) => ({
    id,
    label: types[id],
    icon: DATE_FILTER_ICONS[id],
    count: counts[id],
  }));
  if (counts.upcoming_30 > 0) {
    items.push({
      id: "upcoming_30",
      label: types.upcoming_30,
      icon: DATE_FILTER_ICONS.upcoming_30,
      count: counts.upcoming_30,
      tone: "accent",
      dividerBefore: true,
    });
  }
  return items;
}

export function DatesAppPage() {
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<DateFilterId>("all");
  const [viewMode, setViewMode] = useState<DatesViewMode>("grid");
  const [store, setStore] = useState(createEmptyNSKDatesSchema);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [dateSearch, setDateSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NSKDateItem | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [itemPendingDelete, setItemPendingDelete] = useState<NSKDateItem | null>(null);

  useAppLocalHydration(readNSKDatesStorage, setStore, setIsStoreHydrated, {
    appViewKey: "dates",
    validModes: DATES_VIEW_MODES,
    defaultView: "grid",
    setViewMode,
  });

  const categoryCounts: Record<DateFilterId, number> = {
    all: store.items.length,
    birthday: 0,
    anniversary: 0,
    reminder: 0,
    milestone: 0,
    memorial: 0,
    document_expiration: 0,
    other: 0,
    upcoming_30: 0,
  };
  for (const item of store.items) {
    categoryCounts[item.type_id]++;
    if (isUpcomingWithin30Days(item)) {
      categoryCounts.upcoming_30++;
    }
  }

  useEffect(() => {
    if (activeFilter !== "upcoming_30" || categoryCounts.upcoming_30 > 0) return;
    const id = requestAnimationFrame(() => {
      setActiveFilter("all");
    });
    return () => cancelAnimationFrame(id);
  }, [activeFilter, categoryCounts.upcoming_30]);

  const filteredItems =
    activeFilter === "all"
      ? store.items
      : activeFilter === "upcoming_30"
        ? store.items.filter((item) => isUpcomingWithin30Days(item))
        : store.items.filter((item) => item.type_id === activeFilter);

  const searchFilteredItems = filterItemsBySearch(filteredItems, dateSearch, dateMatchesSearch);
  const sortedItems = [...searchFilteredItems].sort((a, b) => a.date.localeCompare(b.date));

  const datesFilterItems = buildDatesFilterItems(t.dates.types, categoryCounts);

  function updateStore(nextItems: NSKDateItem[]) {
    const nextStore = {
      ...store,
      items: nextItems,
    };
    setStore(nextStore);
    writeNSKDatesStorage(nextStore);
  }

  function handleCreateOrUpdate(values: {
    label: string;
    type_id: NSKDateItem["type_id"];
    date: string;
    is_recurring: boolean;
    notes: string;
  }) {
    const now = new Date().toISOString();
    if (!editingItem) {
      const newItem: NSKDateItem = {
        id: crypto.randomUUID(),
        label: values.label,
        type_id: values.type_id,
        date: values.date,
        is_recurring: values.is_recurring,
        notes: values.notes || undefined,
        created_at: now,
        updated_at: now,
      };
      updateStore([...store.items, newItem]);
      appCrudToast(t, "dates", "created");
    } else {
      const nextItems = store.items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              label: values.label,
              type_id: values.type_id,
              date: values.date,
              is_recurring: values.is_recurring,
              notes: values.notes || undefined,
              updated_at: now,
            }
          : item
      );
      updateStore(nextItems);
      appCrudToast(t, "dates", "updated");
    }

    setEditingItem(null);
    setSheetOpen(false);
  }

  function handleRequestDelete(item: NSKDateItem) {
    setItemPendingDelete(item);
  }

  function handleConfirmDelete() {
    if (!itemPendingDelete) return;
    updateStore(store.items.filter((entry) => entry.id !== itemPendingDelete.id));
    appCrudToast(t, "dates", "deleted");
    setItemPendingDelete(null);
  }

  function openCreateSheet() {
    setEditingItem(null);
    setSheetOpen(true);
  }

  function openEditSheet(item: NSKDateItem) {
    setEditingItem(item);
    setSheetOpen(true);
  }

  function handleViewModeChange(next: DatesViewMode) {
    setViewMode(next);
    persistAppViewBundle("dates", next);
    if (next === "calendar") {
      setCalendarMonth(startOfMonth(new Date()));
    }
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={itemPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setItemPendingDelete(null);
        }}
        title={t.dates.deleteDialogTitle}
        description={t.dates.deleteDialogDescription}
        itemLabel={itemPendingDelete?.label ?? null}
        cancelLabel={t.dates.deleteDialogCancel}
        confirmLabel={t.dates.deleteDialogConfirm}
        onConfirm={handleConfirmDelete}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <FilterSidebarDesktopAside<DateFilterId>
          title={t.dates.sidebarTitle}
          items={datesFilterItems}
          activeId={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <FilterSidebarMobileSheet<DateFilterId>
          open={categoriesOpen}
          onOpenChange={setCategoriesOpen}
          title={t.dates.sidebarTitle}
          items={datesFilterItems}
          activeId={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <FilterSidebarMobileBar
            title={t.dates.sidebarTitle}
            onOpen={() => setCategoriesOpen(true)}
            openButtonAriaLabel={t.dates.openCategoriesNav}
          />
          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            <AppListToolbar<DatesViewMode>
              totalLabel={t.dates.totalLabel.replace("{count}", String(searchFilteredItems.length))}
              viewModes={[
                { id: "grid", icon: LayoutGrid, ariaLabel: t.dates.viewGrid },
                { id: "list", icon: List, ariaLabel: t.dates.viewList },
                { id: "calendar", icon: Calendar, ariaLabel: t.dates.viewCalendar },
              ]}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              addButtonLabel={t.dates.addNew}
              onAdd={openCreateSheet}
              search={{
                value: dateSearch,
                onChange: setDateSearch,
                placeholder: t.dates.searchPlaceholder,
                "aria-label": t.dates.searchAriaLabel,
              }}
            />

            {!isStoreHydrated ? (
              <DatesViewSkeleton viewMode={viewMode} />
            ) : store.items.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarX2 />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.dates.emptyTitle}
                  </EmptyTitle>
                  <EmptyDescription>
                    {activeFilter === "upcoming_30"
                      ? t.dates.upcomingEmpty
                      : t.dates.emptyBody}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={openCreateSheet}>{t.dates.addNew}</Button>
                </EmptyContent>
              </Empty>
            ) : sortedItems.length === 0 && dateSearch.trim() ? (
              <ListSearchEmptyState
                labels={{
                  title: t.dates.searchEmptyTitle,
                  body: t.dates.searchEmptyBody,
                  clear: t.dates.searchClear,
                }}
                onClear={() => setDateSearch("")}
              />
            ) : sortedItems.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarX2 />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.dates.emptyTitle}
                  </EmptyTitle>
                  <EmptyDescription>
                    {activeFilter === "upcoming_30"
                      ? t.dates.upcomingEmpty
                      : t.dates.emptyBody}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button type="button" variant="outline" onClick={() => setActiveFilter("all")}>
                    {t.dates.types.all}
                  </Button>
                  <Button className="ml-2" onClick={openCreateSheet}>
                    {t.dates.addNew}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <DatesView
                items={sortedItems}
                viewMode={viewMode}
                locale={locale}
                calendarMonth={calendarMonth}
                onCalendarMonthChange={setCalendarMonth}
                onEdit={openEditSheet}
                onDelete={handleRequestDelete}
              />
            )}
          </div>
        </div>
      </div>

      <AddDateSheet
        open={sheetOpen}
        editingItem={editingItem}
        onClose={() => {
          setSheetOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
}

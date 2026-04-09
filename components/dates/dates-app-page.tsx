"use client";

import { startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  createEmptyNSKDatesSchema,
  type DateFilterId,
  type DatesViewMode,
  type NSKDateItem,
} from "@/lib/dates/schema";
import { readNSKDatesStorage, writeNSKDatesStorage } from "@/lib/dates/storage";
import {
  persistDatesViewCookie,
  readDatesViewCookie,
} from "@/lib/dates/view-persistence";
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
  DatesCategoriesMobileSheet,
  DatesCategoryDesktopAside,
  DatesCategoryMobileBar,
} from "./dates-sidebar";
import { DatesToolbar } from "./dates-toolbar";
import { DatesEmptyState } from "./dates-empty-state";
import { AddDateSheet } from "./add-date-sheet";
import { DatesCalendarView } from "./dates-calendar-view";
import { DatesMonthSections } from "./dates-month-sections";
import { Upcoming30DaysCard } from "./upcoming-30-days-card";

export function DatesAppPage() {
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<DateFilterId>("all");
  const [viewMode, setViewMode] = useState<DatesViewMode>("grid");
  const [store, setStore] = useState(createEmptyNSKDatesSchema);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NSKDateItem | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [itemPendingDelete, setItemPendingDelete] = useState<NSKDateItem | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setStore(readNSKDatesStorage());
      const fromCookie = readDatesViewCookie();
      if (fromCookie) setViewMode(fromCookie);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const categoryCounts: Record<DateFilterId, number> = {
    all: store.items.length,
    birthday: 0,
    anniversary: 0,
    reminder: 0,
    milestone: 0,
    memorial: 0,
    other: 0,
  };
  for (const item of store.items) {
    categoryCounts[item.type_id]++;
  }

  const filteredItems =
    activeFilter === "all"
      ? store.items
      : store.items.filter((item) => item.type_id === activeFilter);

  const sortedItems = [...filteredItems].sort((a, b) => a.date.localeCompare(b.date));

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
    persistDatesViewCookie(next);
    if (next === "calendar") {
      setCalendarMonth(startOfMonth(new Date()));
    }
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <AlertDialog
        open={itemPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setItemPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dates.deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {itemPendingDelete
                ? t.dates.deleteDialogDescription.replace("{label}", itemPendingDelete.label)
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.dates.deleteDialogCancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => handleConfirmDelete()}>
              {t.dates.deleteDialogConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <DatesCategoryDesktopAside
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={categoryCounts}
        />
        <DatesCategoriesMobileSheet
          open={categoriesOpen}
          onOpenChange={setCategoriesOpen}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={categoryCounts}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DatesCategoryMobileBar onOpenCategories={() => setCategoriesOpen(true)} />
          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            <DatesToolbar
              total={filteredItems.length}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onAdd={openCreateSheet}
            />

            {sortedItems.length === 0 ? (
              <DatesEmptyState onAdd={openCreateSheet} />
            ) : (
              <>
                {viewMode === "calendar" ? (
                  <DatesCalendarView
                    items={sortedItems}
                    locale={locale}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onEdit={openEditSheet}
                  />
                ) : (
                  <DatesMonthSections
                    items={sortedItems}
                    viewMode={viewMode}
                    locale={locale}
                    onEdit={openEditSheet}
                    onDelete={handleRequestDelete}
                  />
                )}
                <Upcoming30DaysCard items={sortedItems} />
              </>
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

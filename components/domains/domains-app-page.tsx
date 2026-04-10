"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  createEmptyNSKDomainsSchema,
  type DomainFilterId,
  type DomainsViewMode,
  type NSKDomainItem,
} from "@/lib/domains/schema";
import { isExpiringSoon } from "@/lib/domains/expiry";
import { readNSKDomainsStorage, writeNSKDomainsStorage } from "@/lib/domains/storage";
import {
  persistDomainsViewCookie,
  readDomainsViewCookie,
} from "@/lib/domains/view-persistence";
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
  DomainsFilterDesktopAside,
  DomainsFilterMobileBar,
  DomainsFiltersMobileSheet,
} from "./domains-sidebar";
import { DomainsToolbar } from "./domains-toolbar";
import { DomainsEmptyState } from "./domains-empty-state";
import { DomainsExpiringBanner } from "./domains-expiring-banner";
import { AddDomainSheet } from "./add-domain-sheet";
import { DomainsContent } from "./domains-content";

function uniqueSortedRegistrars(items: NSKDomainItem[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const r = item.registrar.trim();
    if (r) set.add(r);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

type DomainSubmitValues = {
  domain_name: string;
  registrar: string;
  purchased_at: string;
  expires_on: string;
  status_id: NSKDomainItem["status_id"];
  auto_renew: boolean;
  price: string;
  notes: string;
};

export function DomainsAppPage() {
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<DomainFilterId>("all");
  const [viewMode, setViewMode] = useState<DomainsViewMode>("grid");
  const [store, setStore] = useState(createEmptyNSKDomainsSchema);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NSKDomainItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<NSKDomainItem | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setStore(readNSKDomainsStorage());
      const fromCookie = readDomainsViewCookie();
      if (fromCookie) setViewMode(fromCookie);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const filterCounts: Record<DomainFilterId, number> = {
    all: store.items.length,
    active: 0,
    parked: 0,
    for_sale: 0,
    abandoned: 0,
    expiring_soon: 0,
  };
  for (const item of store.items) {
    filterCounts[item.status_id]++;
    if (isExpiringSoon(item.expires_on)) {
      filterCounts.expiring_soon++;
    }
  }

  const registrarSuggestions = uniqueSortedRegistrars(store.items);

  const filteredItems =
    activeFilter === "all"
      ? store.items
      : activeFilter === "expiring_soon"
        ? store.items.filter((item) => isExpiringSoon(item.expires_on))
        : store.items.filter((item) => item.status_id === activeFilter);

  const sortedItems = [...filteredItems].sort((a, b) =>
    a.expires_on.localeCompare(b.expires_on)
  );

  const showExpiringBanner = store.items.some((item) => isExpiringSoon(item.expires_on));

  function updateStore(nextItems: NSKDomainItem[]) {
    const nextStore = {
      ...store,
      items: nextItems,
    };
    setStore(nextStore);
    writeNSKDomainsStorage(nextStore);
  }

  function handleCreateOrUpdate(values: DomainSubmitValues) {
    const now = new Date().toISOString();
    if (!editingItem) {
      const newItem: NSKDomainItem = {
        id: crypto.randomUUID(),
        domain_name: values.domain_name,
        registrar: values.registrar,
        purchased_at: values.purchased_at,
        expires_on: values.expires_on,
        status_id: values.status_id,
        auto_renew: values.auto_renew,
        price: values.price,
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
              domain_name: values.domain_name,
              registrar: values.registrar,
              purchased_at: values.purchased_at,
              expires_on: values.expires_on,
              status_id: values.status_id,
              auto_renew: values.auto_renew,
              price: values.price,
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

  function handleRequestDelete(item: NSKDomainItem) {
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

  function openEditSheet(item: NSKDomainItem) {
    setEditingItem(item);
    setSheetOpen(true);
  }

  function handleViewModeChange(next: DomainsViewMode) {
    setViewMode(next);
    persistDomainsViewCookie(next);
  }

  const deleteLabel = itemPendingDelete?.domain_name ?? "";

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
            <AlertDialogTitle>{t.domains.deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {itemPendingDelete
                ? t.domains.deleteDialogDescription.replace("{label}", deleteLabel)
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.domains.deleteDialogCancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => handleConfirmDelete()}>
              {t.domains.deleteDialogConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <DomainsFilterDesktopAside
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
        <DomainsFiltersMobileSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DomainsFilterMobileBar onOpenFilters={() => setFiltersOpen(true)} />
          {showExpiringBanner ? <DomainsExpiringBanner /> : null}
          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            <DomainsToolbar
              total={filteredItems.length}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onAdd={openCreateSheet}
            />

            {sortedItems.length === 0 ? (
              <DomainsEmptyState onAdd={openCreateSheet} />
            ) : (
              <DomainsContent
                items={sortedItems}
                viewMode={viewMode}
                locale={locale}
                onEdit={openEditSheet}
                onDelete={handleRequestDelete}
              />
            )}
          </div>
        </div>
      </div>

      <AddDomainSheet
        open={sheetOpen}
        editingItem={editingItem}
        registrarSuggestions={registrarSuggestions}
        onClose={() => {
          setSheetOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
}

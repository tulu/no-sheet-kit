"use client";

import { startOfMonth } from "date-fns";
import {
  AlertTriangle,
  Ban,
  Calendar,
  CircleParking,
  Globe,
  LayoutGrid,
  List,
  RadioTower,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  createEmptyNSKDomainsSchema,
  DOMAINS_VIEW_MODES,
  type DomainFilterId,
  type DomainsViewMode,
  type NSKDomainItem,
} from "@/lib/domains/schema";
import { isExpiringSoon } from "@/lib/domains/domains-helpers";
import { readNSKDomainsStorage, writeNSKDomainsStorage } from "@/lib/domains/storage";
import {
  DOMAINS_VIEW_COOKIE_NAME,
  persistAppViewCookie,
  readAppViewCookie,
} from "@/lib/apps/view-persistence";
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
import { InlineAlertBanner } from "@/components/common/inline-alert-banner";
import { AddDomainSheet } from "./add-domain-sheet";
import { DomainsView } from "./domains-view";

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

const STATUS_SORT_RANK: Record<NSKDomainItem["status_id"], number> = {
  active: 0,
  parked: 1,
  for_sale: 2,
  abandoned: 3,
};

type DomainStatusFilterId = Exclude<DomainFilterId, "expiring_soon">;

const DOMAIN_FILTER_BASE: DomainStatusFilterId[] = [
  "all",
  "active",
  "parked",
  "for_sale",
  "abandoned",
];

const DOMAIN_FILTER_ICONS: Record<DomainFilterId, LucideIcon> = {
  all: Globe,
  active: RadioTower,
  parked: CircleParking,
  for_sale: Tag,
  abandoned: Ban,
  expiring_soon: AlertTriangle,
};

function buildDomainsFilterItems(
  types: {
    all: string;
    active: string;
    parked: string;
    for_sale: string;
    abandoned: string;
    expiringSoon: string;
  },
  counts: Record<DomainFilterId, number>
): FilterSidebarItem<DomainFilterId>[] {
  const items: FilterSidebarItem<DomainFilterId>[] = DOMAIN_FILTER_BASE.map((id) => ({
    id,
    label: types[id],
    icon: DOMAIN_FILTER_ICONS[id],
    count: counts[id],
  }));
  if (counts.expiring_soon > 0) {
    items.push({
      id: "expiring_soon",
      label: types.expiringSoon,
      icon: DOMAIN_FILTER_ICONS.expiring_soon,
      count: counts.expiring_soon,
      tone: "destructive",
      dividerBefore: true,
    });
  }
  return items;
}

export function DomainsAppPage() {
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<DomainFilterId>("all");
  const [viewMode, setViewMode] = useState<DomainsViewMode>("grid");
  const [store, setStore] = useState(createEmptyNSKDomainsSchema);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NSKDomainItem | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [itemPendingDelete, setItemPendingDelete] = useState<NSKDomainItem | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setStore(readNSKDomainsStorage());
      const fromCookie = readAppViewCookie(DOMAINS_VIEW_COOKIE_NAME, DOMAINS_VIEW_MODES);
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

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (activeFilter === "all") {
      const byStatus = STATUS_SORT_RANK[a.status_id] - STATUS_SORT_RANK[b.status_id];
      if (byStatus !== 0) return byStatus;
    }
    const byExpiry = a.expires_on.localeCompare(b.expires_on);
    if (byExpiry !== 0) return byExpiry;
    return a.domain_name.localeCompare(b.domain_name);
  });

  const showExpiringBanner = store.items.some((item) => isExpiringSoon(item.expires_on));

  const domainsFilterItems = buildDomainsFilterItems(t.domains.types, filterCounts);

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
    persistAppViewCookie(DOMAINS_VIEW_COOKIE_NAME, next);
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
        title={t.domains.deleteDialogTitle}
        description={t.domains.deleteDialogDescription}
        itemLabel={itemPendingDelete?.domain_name ?? null}
        cancelLabel={t.domains.deleteDialogCancel}
        confirmLabel={t.domains.deleteDialogConfirm}
        onConfirm={handleConfirmDelete}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <FilterSidebarDesktopAside<DomainFilterId>
          title={t.domains.sidebarTitle}
          items={domainsFilterItems}
          activeId={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <FilterSidebarMobileSheet<DomainFilterId>
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title={t.domains.sidebarTitle}
          items={domainsFilterItems}
          activeId={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <FilterSidebarMobileBar
            title={t.domains.sidebarTitle}
            onOpen={() => setFiltersOpen(true)}
            openButtonAriaLabel={t.domains.openFiltersNav}
          />
          {showExpiringBanner ? (
            <InlineAlertBanner
              title={t.domains.types.expiringSoon}
              description={t.domains.expiringBanner}
            />
          ) : null}
          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            <AppListToolbar<DomainsViewMode>
              totalLabel={t.domains.totalLabel.replace("{count}", String(filteredItems.length))}
              viewModes={[
                { id: "grid", icon: LayoutGrid, ariaLabel: t.domains.viewGrid },
                { id: "list", icon: List, ariaLabel: t.domains.viewList },
                { id: "calendar", icon: Calendar, ariaLabel: t.domains.viewCalendar },
              ]}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              addButtonLabel={t.domains.addNew}
              onAdd={openCreateSheet}
            />

            {sortedItems.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Globe />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.domains.emptyTitle}
                  </EmptyTitle>
                  <EmptyDescription>{t.domains.emptyBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={openCreateSheet}>{t.domains.addNew}</Button>
                </EmptyContent>
              </Empty>
            ) : (
              <DomainsView
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

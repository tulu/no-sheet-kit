"use client";

import {
  ArrowDownToLine,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  List,
  Settings2,
  Share2,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
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
import { appCollectionsCollectionToast, appCrudToast } from "@/lib/app-toasts";
import {
  COLLECTIONS_DASHBOARD_NAV_ID,
  COLLECTIONS_SIDEBAR_POSSESSION_STATUSES,
  COLLECTIONS_VIEW_MODES,
  createEmptyNSKCollectionsSchema,
  possessionNavId,
  parsePossessionNavId,
  type CollectionsSidebarPossessionStatus,
  type CollectionsViewMode,
  type NSKCollection,
  type NSKCollectionItem,
  type NSKCollectionsSchema,
  type PossessionStatus,
} from "@/lib/collections/schema";
import { readNSKCollectionsStorage, writeNSKCollectionsStorage } from "@/lib/collections/storage";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import {
  countItemsByPossession,
  itemLinkHref,
  itemMatchesSearch,
  itemsByPossessionStatus,
  itemsInCollection,
  nextOrderForCollection,
  sortCollections,
} from "@/lib/collections/collections-helpers";
import { AddCollectionSheet } from "./add-collection-sheet";
import { AddItemSheet } from "./add-item-sheet";
import { CollectionsDashboard } from "./collections-dashboard";
import { CollectionsView } from "./collections-view";
import { CollectionsViewSkeleton } from "./collections-view-skeleton";
import { DeleteCollectionWithItemsDialog } from "./delete-collection-with-items-dialog";
import { ManageCollectionsSheet } from "./manage-collections-sheet";

type NavId = typeof COLLECTIONS_DASHBOARD_NAV_ID | string;

const POSSESSION_SIDEBAR_ICONS: Record<CollectionsSidebarPossessionStatus, LucideIcon> = {
  lent_out: Share2,
  borrowed: ArrowDownToLine,
  wanted: Star,
};

export function CollectionsAppPage() {
  const sessionSuffix = useSessionStorageSuffix();
  const { locale, t } = useI18n();
  const [activeNav, setActiveNav] = useState<NavId>(COLLECTIONS_DASHBOARD_NAV_ID);
  const [viewMode, setViewMode] = useState<CollectionsViewMode>("grid");
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [store, setStore] = useState<NSKCollectionsSchema>(createEmptyNSKCollectionsSchema);
  const [itemSearch, setItemSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [collectionSheetOpen, setCollectionSheetOpen] = useState(false);
  const [collectionSheetInitialName, setCollectionSheetInitialName] = useState<string | undefined>(
    undefined
  );
  const [reopenManageAfterCollectionSheet, setReopenManageAfterCollectionSheet] = useState(false);
  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<NSKCollection | null>(null);

  const [itemSheetOpen, setItemSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NSKCollectionItem | null>(null);

  const [itemPendingDelete, setItemPendingDelete] = useState<NSKCollectionItem | null>(null);
  const [collectionPendingDelete, setCollectionPendingDelete] = useState<NSKCollection | null>(null);
  const [collectionDeleteWithItems, setCollectionDeleteWithItems] = useState<NSKCollection | null>(
    null
  );

  useAppLocalHydration(() => readNSKCollectionsStorage(sessionSuffix), setStore, setIsStoreHydrated, {
    appViewKey: "collections",
    validModes: COLLECTIONS_VIEW_MODES,
    defaultView: "grid",
    setViewMode,
  });

  function handleNavChange(next: NavId) {
    setActiveNav(next);
  }

  const commit = useCallback(
    (updater: (prev: NSKCollectionsSchema) => NSKCollectionsSchema) => {
      setStore((prev) => {
        const next = updater(prev);
        writeNSKCollectionsStorage(sessionSuffix, next);
        return next;
      });
    },
    [sessionSuffix]
  );

  const collectionsSorted = sortCollections(store.collections);

  const activePossessionStatus = parsePossessionNavId(activeNav);

  const activeCollection = (() => {
    if (activeNav === COLLECTIONS_DASHBOARD_NAV_ID || activePossessionStatus) return null;
    return store.collections.find((c) => c.id === activeNav) ?? null;
  })();

  const activeCollectionId = activeCollection?.id ?? null;

  const sidebarItems: FilterSidebarItem<NavId>[] = (() => {
    const rows: FilterSidebarItem<NavId>[] = [
      {
        id: COLLECTIONS_DASHBOARD_NAV_ID,
        label: t.collections.dashboardNav,
        icon: LayoutDashboard,
        count: 0,
        hideCount: true,
        tone: "accent",
      },
    ];
    let firstCollection = true;
    for (const c of collectionsSorted) {
      const n = store.items.filter((i) => i.collection_id === c.id).length;
      rows.push({
        id: c.id,
        label: c.name,
        icon: Layers,
        count: n,
        dividerBefore: firstCollection,
      });
      firstCollection = false;
    }
    const possessionCounts = countItemsByPossession(store.items);
    let firstPossession = true;
    for (const status of COLLECTIONS_SIDEBAR_POSSESSION_STATUSES) {
      rows.push({
        id: possessionNavId(status),
        label: t.collections.possessionLabels[status],
        icon: POSSESSION_SIDEBAR_ICONS[status],
        count: possessionCounts[status],
        dividerBefore: firstPossession,
      });
      firstPossession = false;
    }
    return rows;
  })();

  const collectionItemsRaw = (() => {
    if (activeNav === COLLECTIONS_DASHBOARD_NAV_ID) return [];
    if (activePossessionStatus) {
      return itemsByPossessionStatus(store.items, store.collections, activePossessionStatus);
    }
    if (activeCollectionId) return itemsInCollection(store.items, activeCollectionId);
    return [];
  })();

  const searchFilteredItems = filterItemsBySearch(collectionItemsRaw, itemSearch, itemMatchesSearch);

  function handleViewModeChange(next: CollectionsViewMode) {
    setViewMode(next);
    persistAppViewBundle("collections", next);
  }

  function openCreateItem() {
    if (!activeCollectionId || activePossessionStatus) return;
    setEditingItem(null);
    setItemSheetOpen(true);
  }

  const collectionNameById = (() => {
    const m = new Map<string, string>();
    for (const c of store.collections) m.set(c.id, c.name);
    return m;
  })();

  const getCollectionLabelForItem = useCallback(
    (item: NSKCollectionItem) => collectionNameById.get(item.collection_id),
    [collectionNameById]
  );

  function openEditItem(item: NSKCollectionItem) {
    setEditingItem(item);
    setItemSheetOpen(true);
  }

  function openCreateCollection(initialName?: string) {
    setEditingCollection(null);
    setCollectionSheetInitialName(initialName);
    setCollectionSheetOpen(true);
  }

  function openEditCollection(collection: NSKCollection) {
    setEditingCollection(collection);
    setCollectionSheetInitialName(undefined);
    setCollectionSheetOpen(true);
  }

  function closeCollectionSheet() {
    setCollectionSheetOpen(false);
    setEditingCollection(null);
    setCollectionSheetInitialName(undefined);
    if (reopenManageAfterCollectionSheet) {
      setReopenManageAfterCollectionSheet(false);
      setManageSheetOpen(true);
    }
  }

  function openManageCollections() {
    setManageSheetOpen(true);
  }

  function openAddCollectionFromManage() {
    setReopenManageAfterCollectionSheet(true);
    setManageSheetOpen(false);
    openCreateCollection(t.collections.defaultCollectionName);
  }

  function openRenameCollectionFromManage(collection: NSKCollection) {
    setReopenManageAfterCollectionSheet(true);
    setManageSheetOpen(false);
    openEditCollection(collection);
  }

  function requestDeleteCollection(collection: NSKCollection) {
    const itemCount = store.items.filter((i) => i.collection_id === collection.id).length;
    if (itemCount === 0) {
      setCollectionPendingDelete(collection);
      return;
    }
    setCollectionDeleteWithItems(collection);
  }

  function dismissCollectionSheetAfterSave() {
    setCollectionSheetOpen(false);
    setEditingCollection(null);
    setCollectionSheetInitialName(undefined);
    setReopenManageAfterCollectionSheet(false);
  }

  function handleCollectionSubmit(values: {
    name: string;
    show_price: boolean;
    show_link: boolean;
  }) {
    const now = new Date().toISOString();
    if (editingCollection) {
      commit((prev) => ({
        ...prev,
        collections: prev.collections.map((c) =>
          c.id === editingCollection.id
            ? {
                ...c,
                name: values.name,
                show_price: values.show_price,
                show_link: values.show_link,
                updated_at: now,
              }
            : c
        ),
      }));
      appCollectionsCollectionToast(t, "updated");
      dismissCollectionSheetAfterSave();
      return;
    }
    commit((prev) => {
      const maxOrder = Math.max(-1, ...prev.collections.map((c) => c.order));
      const id = crypto.randomUUID();
      const row: NSKCollection = {
        id,
        name: values.name,
        order: maxOrder + 1,
        show_price: values.show_price,
        show_link: values.show_link,
        created_at: now,
        updated_at: now,
      };
      return { ...prev, collections: [...prev.collections, row] };
    });
    appCollectionsCollectionToast(t, "created");
    dismissCollectionSheetAfterSave();
  }

  function confirmDeleteCollection() {
    if (!collectionPendingDelete) return;
    const cid = collectionPendingDelete.id;
    commit((prev) => ({
      ...prev,
      collections: prev.collections.filter((c) => c.id !== cid),
      items: prev.items.filter((i) => i.collection_id !== cid),
    }));
    appCollectionsCollectionToast(t, "deleted");
    if (activeNav === cid) {
      setActiveNav(COLLECTIONS_DASHBOARD_NAV_ID);
    }
    setCollectionPendingDelete(null);
  }

  function confirmDeleteCollectionMoveItems(targetCollectionId: string) {
    if (!collectionDeleteWithItems) return;
    const cid = collectionDeleteWithItems.id;
    const now = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      collections: prev.collections.filter((c) => c.id !== cid),
      items: prev.items.map((i) =>
        i.collection_id === cid ? { ...i, collection_id: targetCollectionId, updated_at: now } : i
      ),
    }));
    appCollectionsCollectionToast(t, "deleted");
    if (activeNav === cid) {
      setActiveNav(COLLECTIONS_DASHBOARD_NAV_ID);
    }
    setCollectionDeleteWithItems(null);
    setManageSheetOpen(false);
  }

  function confirmDeleteCollectionAndAllItems() {
    if (!collectionDeleteWithItems) return;
    const cid = collectionDeleteWithItems.id;
    commit((prev) => ({
      ...prev,
      collections: prev.collections.filter((c) => c.id !== cid),
      items: prev.items.filter((i) => i.collection_id !== cid),
    }));
    appCollectionsCollectionToast(t, "deleted");
    if (activeNav === cid) {
      setActiveNav(COLLECTIONS_DASHBOARD_NAV_ID);
    }
    setCollectionDeleteWithItems(null);
    setManageSheetOpen(false);
  }

  function handleSaveItemFromForm(values: {
    name: string;
    notes: string;
    possession_status: PossessionStatus;
    related_date: string;
    related_person: string;
    currency: string;
    price: string;
    link: string;
  }) {
    const targetCollection = editingItem
      ? store.collections.find((c) => c.id === editingItem.collection_id)
      : activeCollection;
    const newItemCollectionId = editingItem ? undefined : activeCollectionId;

    if (!targetCollection) return;
    if (!editingItem && !newItemCollectionId) return;

    const now = new Date().toISOString();
    const relatedDate =
      values.related_date && /^\d{4}-\d{2}-\d{2}$/.test(values.related_date)
        ? values.related_date
        : undefined;
    const relatedPerson = values.related_person.trim() || undefined;
    let price: number | undefined;
    let itemCurrency: string | undefined;
    if (targetCollection.show_price && values.price.trim()) {
      const n = Number(values.price.replace(",", "."));
      if (Number.isFinite(n)) {
        price = n;
        itemCurrency = (values.currency?.trim() || "USD").toUpperCase();
      }
    }
    const linkTrimmed = values.link.trim().slice(0, 2048);
    const itemLink =
      targetCollection.show_link && linkTrimmed && itemLinkHref(linkTrimmed)
        ? linkTrimmed
        : undefined;

    if (editingItem) {
      commit((prev) => ({
        ...prev,
        items: prev.items.map((x) =>
          x.id === editingItem.id
            ? {
                ...x,
                name: values.name,
                notes: values.notes.trim() || undefined,
                possession_status: values.possession_status,
                related_date: relatedDate,
                related_person: relatedPerson,
                price: targetCollection.show_price ? price : undefined,
                currency: targetCollection.show_price && price != null ? itemCurrency : undefined,
                link: itemLink,
                updated_at: now,
              }
            : x
        ),
      }));
      appCrudToast(t, "collections", "updated");
      return;
    }
    commit((prev) => {
      const order = nextOrderForCollection(prev.items, newItemCollectionId!);
      const id = crypto.randomUUID();
      const row: NSKCollectionItem = {
        id,
        collection_id: newItemCollectionId!,
        name: values.name,
        notes: values.notes.trim() || undefined,
        possession_status: values.possession_status,
        related_date: relatedDate,
        related_person: relatedPerson,
        price: targetCollection.show_price ? price : undefined,
        currency: targetCollection.show_price && price != null ? itemCurrency : undefined,
        link: itemLink,
        order,
        created_at: now,
        updated_at: now,
      };
      return { ...prev, items: [...prev.items, row] };
    });
    appCrudToast(t, "collections", "created");
  }

  function confirmDeleteItem() {
    if (!itemPendingDelete) return;
    commit((prev) => ({
      ...prev,
      items: prev.items.filter((x) => x.id !== itemPendingDelete.id),
    }));
    appCrudToast(t, "collections", "deleted");
    setItemPendingDelete(null);
  }

  const showPriceCol = (() => {
    if (activePossessionStatus) {
      const flags = new Map(store.collections.map((c) => [c.id, c.show_price]));
      return collectionItemsRaw.some((i) => flags.get(i.collection_id));
    }
    return Boolean(activeCollection?.show_price);
  })();

  const sheetShowPrice = Boolean(
    editingItem
      ? store.collections.find((c) => c.id === editingItem.collection_id)?.show_price
      : activeCollection?.show_price
  );

  const showLinkCol = (() => {
    if (activePossessionStatus) {
      const flags = new Map(store.collections.map((c) => [c.id, c.show_link]));
      return collectionItemsRaw.some((i) => flags.get(i.collection_id));
    }
    return Boolean(activeCollection?.show_link);
  })();

  const sheetShowLink = Boolean(
    editingItem
      ? store.collections.find((c) => c.id === editingItem.collection_id)?.show_link
      : activeCollection?.show_link
  );

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={itemPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setItemPendingDelete(null);
        }}
        title={t.collections.deleteItemTitle}
        description={t.collections.deleteItemDescription}
        itemLabel={itemPendingDelete?.name ?? ""}
        cancelLabel={t.collections.deleteCancel}
        confirmLabel={t.collections.deleteConfirm}
        onConfirm={confirmDeleteItem}
      />
      <ConfirmDeleteAlertDialog
        open={collectionPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setCollectionPendingDelete(null);
        }}
        title={t.collections.deleteCollectionTitle}
        description={t.collections.deleteCollectionDescription}
        itemLabel={collectionPendingDelete?.name ?? ""}
        cancelLabel={t.collections.deleteCancel}
        confirmLabel={t.collections.deleteConfirm}
        onConfirm={confirmDeleteCollection}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <FilterSidebarDesktopAside<NavId>
          title={t.collections.sidebarTitle}
          items={sidebarItems}
          activeId={activeNav}
          onFilterChange={handleNavChange}
          footer={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={openManageCollections}
            >
              <Settings2 className="size-4 shrink-0" aria-hidden />
              {t.collections.manageCollectionsTitle}
            </Button>
          }
        />

        <FilterSidebarMobileSheet<NavId>
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title={t.collections.sidebarTitle}
          items={sidebarItems}
          activeId={activeNav}
          onFilterChange={handleNavChange}
          footer={
            <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={openManageCollections}>
              <Settings2 className="size-4 shrink-0" aria-hidden />
              {t.collections.manageCollectionsTitle}
            </Button>
          }
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <FilterSidebarMobileBar
            title={t.collections.sidebarTitle}
            onOpen={() => setFiltersOpen(true)}
            openButtonAriaLabel={t.collections.openCollectionsNav}
            endSlot={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={openManageCollections}
                aria-label={t.collections.manageCollectionsTitle}
              >
                <Settings2 className="size-4" aria-hidden />
              </Button>
            }
          />

          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            {!isStoreHydrated ? (
              activeNav === COLLECTIONS_DASHBOARD_NAV_ID ? (
                <div className="space-y-4">
                  <div className="h-40 animate-pulse rounded-lg bg-muted/40" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
                    <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
                  </div>
                </div>
              ) : (
                <>
                  <AppListToolbar<CollectionsViewMode>
                    totalLabel={t.collections.totalLabel.replace("{count}", "0")}
                    viewModes={[
                      { id: "grid", icon: LayoutGrid, ariaLabel: t.collections.viewGrid },
                      { id: "list", icon: List, ariaLabel: t.collections.viewList },
                    ]}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    addButtonLabel={t.collections.addItem}
                    onAdd={openCreateItem}
                    showAddButton={!activePossessionStatus}
                    search={{
                      value: itemSearch,
                      onChange: setItemSearch,
                      placeholder: t.collections.searchPlaceholder,
                      "aria-label": t.collections.searchAriaLabel,
                    }}
                  />
                  <CollectionsViewSkeleton
                    viewMode={viewMode}
                    showPrice={
                      activePossessionStatus
                        ? false
                        : Boolean(store.collections.find((c) => c.id === activeNav)?.show_price)
                    }
                    showLink={
                      activePossessionStatus
                        ? false
                        : Boolean(store.collections.find((c) => c.id === activeNav)?.show_link)
                    }
                  />
                </>
              )
            ) : activeNav === COLLECTIONS_DASHBOARD_NAV_ID ? (
              store.collections.length === 0 ? (
                <Empty className="border border-border p-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Layers />
                    </EmptyMedia>
                    <EmptyTitle className="text-xl font-semibold text-foreground">
                      {t.collections.dashboardEmptyTitle}
                    </EmptyTitle>
                    <EmptyDescription>{t.collections.dashboardEmptyBody}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button type="button" onClick={() => openCreateCollection(t.collections.defaultCollectionName)}>
                      {t.collections.dashboardEmptyCta}
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <CollectionsDashboard schema={store} onOpenCollection={(id) => setActiveNav(id)} />
              )
            ) : (
              <>
                <AppListToolbar<CollectionsViewMode>
                  totalLabel={t.collections.totalLabel.replace(
                    "{count}",
                    String(searchFilteredItems.length)
                  )}
                  viewModes={[
                    { id: "grid", icon: LayoutGrid, ariaLabel: t.collections.viewGrid },
                    { id: "list", icon: List, ariaLabel: t.collections.viewList },
                  ]}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  addButtonLabel={t.collections.addItem}
                  onAdd={openCreateItem}
                  showAddButton={!activePossessionStatus}
                  search={{
                    value: itemSearch,
                    onChange: setItemSearch,
                    placeholder: t.collections.searchPlaceholder,
                    "aria-label": t.collections.searchAriaLabel,
                  }}
                />
                {collectionItemsRaw.length === 0 ? (
                  <Empty className="border border-border p-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Layers />
                      </EmptyMedia>
                      <EmptyTitle className="text-xl font-semibold text-foreground">
                        {activePossessionStatus
                          ? t.collections.emptyPossessionTitle
                          : t.collections.emptyCollectionTitle}
                      </EmptyTitle>
                      <EmptyDescription>
                        {activePossessionStatus
                          ? t.collections.emptyPossessionBody
                          : t.collections.emptyCollectionBody}
                      </EmptyDescription>
                    </EmptyHeader>
                    {activePossessionStatus ? null : (
                      <EmptyContent>
                        <Button onClick={openCreateItem}>{t.collections.addItem}</Button>
                      </EmptyContent>
                    )}
                  </Empty>
                ) : searchFilteredItems.length === 0 && itemSearch.trim() ? (
                  <ListSearchEmptyState
                    labels={{
                      title: t.collections.emptySearchTitle,
                      body: t.collections.emptySearchBody,
                      clear: t.collections.searchClear,
                    }}
                    onClear={() => setItemSearch("")}
                  />
                ) : (
                  <CollectionsView
                    items={searchFilteredItems}
                    viewMode={viewMode}
                    locale={locale}
                    showPrice={showPriceCol}
                    showLink={showLinkCol}
                    onEdit={openEditItem}
                    onDelete={(item) => setItemPendingDelete(item)}
                    showPossessionBadge={!activePossessionStatus}
                    getCollectionLabel={
                      activePossessionStatus ? getCollectionLabelForItem : undefined
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ManageCollectionsSheet
        open={manageSheetOpen}
        onOpenChange={setManageSheetOpen}
        collections={collectionsSorted}
        onAddCollection={openAddCollectionFromManage}
        onRenameCollection={openRenameCollectionFromManage}
        onDeleteCollection={(c) => {
          requestDeleteCollection(c);
          setManageSheetOpen(false);
        }}
      />

      <DeleteCollectionWithItemsDialog
        key={collectionDeleteWithItems?.id ?? "closed"}
        open={collectionDeleteWithItems != null}
        collection={collectionDeleteWithItems}
        otherCollections={store.collections}
        itemCount={
          collectionDeleteWithItems
            ? store.items.filter((i) => i.collection_id === collectionDeleteWithItems.id).length
            : 0
        }
        onOpenChange={(open) => {
          if (!open) setCollectionDeleteWithItems(null);
        }}
        onMoveAndDelete={confirmDeleteCollectionMoveItems}
        onDeleteAllItems={confirmDeleteCollectionAndAllItems}
      />

      <AddCollectionSheet
        open={collectionSheetOpen}
        editingCollection={editingCollection}
        initialNameWhenCreate={editingCollection ? undefined : collectionSheetInitialName}
        onClose={closeCollectionSheet}
        onSubmit={handleCollectionSubmit}
      />

      <AddItemSheet
        open={itemSheetOpen}
        editingItem={editingItem}
        showPrice={sheetShowPrice}
        showLink={sheetShowLink}
        onClose={() => {
          setItemSheetOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItemFromForm}
      />
    </div>
  );
}

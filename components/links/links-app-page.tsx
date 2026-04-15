"use client";

import {
  CheckCircle2,
  Circle,
  Hash,
  LayoutGrid,
  Link2,
  List,
  Search,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  LINKS_VIEW_COOKIE_NAME,
  persistAppViewCookie,
  readAppViewCookie,
} from "@/lib/apps/view-persistence";
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
import { AddLinkSheet } from "./add-link-sheet";
import { LinksView } from "./links-view";

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

function buildFilterItems(
  labels: { all: string; reviewed: string; notReviewed: string },
  allCount: number,
  tagCounts: { tag: string; count: number }[],
  reviewedCount: number,
  notReviewedCount: number
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
      id: "reviewed",
      label: labels.reviewed,
      icon: CheckCircle2,
      count: reviewedCount,
      dividerBefore: true,
    },
    {
      id: "not_reviewed",
      label: labels.notReviewed,
      icon: Circle,
      count: notReviewedCount,
    }
  );
  return out;
}

export function LinksAppPage() {
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<LinksViewMode>("grid");
  const [store, setStore] = useState(createEmptyNSKLinksSchema);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NSKLinkItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<NSKLinkItem | null>(null);
  const [linkSearch, setLinkSearch] = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setStore(readNSKLinksStorage());
      const fromCookie = readAppViewCookie(LINKS_VIEW_COOKIE_NAME, LINKS_VIEW_MODES);
      if (fromCookie) setViewMode(fromCookie);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const allCount = store.items.length;
  /** Tags with a single link are hidden from the sidebar (no useful filter). */
  const tagCounts = tagsWithCount(store.items).filter((row) => row.count > 1);
  const reviewedCount = store.items.filter((item) => item.reviewed).length;
  const notReviewedCount = allCount - reviewedCount;
  const activeTag =
    activeFilter !== "reviewed" && activeFilter !== "not_reviewed"
      ? decodeTagFilter(activeFilter)
      : null;
  const filteredItems = store.items.filter((item) => {
    if (activeFilter === "reviewed") return item.reviewed;
    if (activeFilter === "not_reviewed") return !item.reviewed;
    if (activeTag) return itemHasTag(item, activeTag);
    return true;
  });
  const searchFilteredItems = filteredItems.filter((item) => linkMatchesSearch(item, linkSearch));
  const sortedItems = [...searchFilteredItems].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const sidebarItems = buildFilterItems(
    t.links.filters,
    allCount,
    tagCounts,
    reviewedCount,
    notReviewedCount
  );

  function updateStoreItems(mutator: (items: NSKLinkItem[]) => NSKLinkItem[]) {
    setStore((prev) => {
      const nextStore = { ...prev, items: mutator(prev.items) };
      writeNSKLinksStorage(nextStore);
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

  function handleCreateOrUpdate(values: { url: string; manualTags: string[]; reviewed: boolean }) {
    const now = new Date().toISOString();
    if (!editingItem) {
      const newItem: NSKLinkItem = {
        id: crypto.randomUUID(),
        url: values.url,
        manual_tags: values.manualTags,
        auto_tags: [],
        reviewed: values.reviewed,
        reviewed_at: values.reviewed ? now : undefined,
        status: "pending",
        created_at: now,
        updated_at: now,
      };
      updateStoreItems((items) => [...items, newItem]);
      setSheetOpen(false);
      void enrichLink(newItem.id, values.url);
      return;
    }

    const editingId = editingItem.id;
    const previousUrl = editingItem.url;
    updateStoreItems((items) =>
      items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              url: values.url,
              manual_tags: values.manualTags,
              reviewed: values.reviewed,
              reviewed_at: values.reviewed ? item.reviewed_at ?? now : undefined,
              status: values.url !== previousUrl ? "pending" : item.status,
              updated_at: now,
            }
          : item
      )
    );
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

  function handleConfirmDelete() {
    if (!itemPendingDelete) return;
    updateStoreItems((items) => items.filter((item) => item.id !== itemPendingDelete.id));
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
    persistAppViewCookie(LINKS_VIEW_COOKIE_NAME, next);
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

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={itemPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setItemPendingDelete(null);
        }}
        title={t.links.deleteDialogTitle}
        description={t.links.deleteDialogDescription}
        itemLabel={itemPendingDelete?.title ?? itemPendingDelete?.url ?? null}
        cancelLabel={t.links.deleteDialogCancel}
        confirmLabel={t.links.deleteDialogConfirm}
        onConfirm={handleConfirmDelete}
      />

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

            {store.items.length === 0 ? (
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
            ) : sortedItems.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.links.searchEmptyTitle}
                  </EmptyTitle>
                  <EmptyDescription>{t.links.searchEmptyBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  {linkSearch.trim() ? (
                    <Button type="button" variant="outline" onClick={() => setLinkSearch("")}>
                      {t.links.searchClear}
                    </Button>
                  ) : null}
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
      />
    </div>
  );
}

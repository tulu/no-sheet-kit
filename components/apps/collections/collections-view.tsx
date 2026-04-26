"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  CardActionsMenu,
  type CardActionsMenuItem,
} from "@/components/common/card-actions-menu";
import { semanticBadgeOutlineClass } from "@/components/common/semantic-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCollectionPrice,
  formatCollectionsDateShort,
  itemLinkHref,
  lendingRelatedStatuses,
} from "@/lib/collections/collections-helpers";
import type { CollectionsViewMode, NSKCollectionItem } from "@/lib/collections/schema";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { CollectionsItemCards } from "./collections-item-cards";

function collectionItemTableMenuActions(
  labels: { edit: string; delete: string },
  onEdit: () => void,
  onDelete: () => void
): CardActionsMenuItem[] {
  return [
    { label: labels.edit, icon: Pencil, onSelect: onEdit },
    { label: labels.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
}

export type CollectionsViewProps = {
  items: NSKCollectionItem[];
  viewMode: CollectionsViewMode;
  locale: Locale;
  showPrice: boolean;
  showLink: boolean;
  onEdit: (item: NSKCollectionItem) => void;
  onDelete: (item: NSKCollectionItem) => void;
  showPossessionBadge?: boolean;
  getCollectionLabel?: (item: NSKCollectionItem) => string | undefined;
};

export function CollectionsView({
  items,
  viewMode,
  locale,
  showPrice,
  showLink,
  onEdit,
  onDelete,
  showPossessionBadge = true,
  getCollectionLabel,
}: CollectionsViewProps) {
  const { t } = useI18n();
  const showCollectionCol = Boolean(getCollectionLabel);

  if (viewMode === "grid") {
    return (
      <CollectionsItemCards
        items={items}
        locale={locale}
        showPrice={showPrice}
        showLink={showLink}
        onEdit={onEdit}
        onDelete={onDelete}
        showPossessionBadge={showPossessionBadge}
        getCollectionLabel={getCollectionLabel}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.collections.table.name}
            </TableHead>
            {showCollectionCol ? (
              <TableHead className="min-w-[100px] px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.collections.table.collection}
              </TableHead>
            ) : null}
            {showPossessionBadge ? (
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.collections.table.status}
              </TableHead>
            ) : null}
            <TableHead className="min-w-[140px] px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.collections.table.notes}
            </TableHead>
            {showPrice ? (
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.collections.table.price}
              </TableHead>
            ) : null}
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.collections.table.related}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{t.collections.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const rowHref = showLink ? itemLinkHref(item.link) : null;
            return (
            <TableRow key={item.id} className="hover:bg-muted/20">
              <TableCell className="max-w-[280px] px-3 py-2 font-medium text-foreground">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  {rowHref ? (
                    <a
                      href={rowHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.collections.card.openLink}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "icon-sm" }),
                        "inline-flex shrink-0 rounded-md"
                      )}
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </TableCell>
              {showCollectionCol ? (
                <TableCell className="max-w-[160px] px-3 py-2 text-muted-foreground">
                  <span className="block truncate text-sm" title={getCollectionLabel?.(item)}>
                    {getCollectionLabel?.(item) ?? "—"}
                  </span>
                </TableCell>
              ) : null}
              {showPossessionBadge ? (
                <TableCell className="px-3 py-2">
                  <Badge
                    variant="outline"
                    className={cn("font-medium", semanticBadgeOutlineClass(item.possession_status))}
                  >
                    {t.collections.possessionLabels[item.possession_status]}
                  </Badge>
                </TableCell>
              ) : null}
              <TableCell className="max-w-[220px] px-3 py-2 truncate text-muted-foreground">
                {item.notes ?? "—"}
              </TableCell>
              {showPrice ? (
                <TableCell className="px-3 py-2 tabular-nums text-muted-foreground">
                  {item.price != null
                    ? formatCollectionPrice(item.price, item.currency, locale)
                    : "—"}
                </TableCell>
              ) : null}
              <TableCell className="max-w-[200px] px-3 py-2 text-muted-foreground">
                {lendingRelatedStatuses(item) ? (
                  <span className="block truncate text-xs">
                    {[
                      item.related_person,
                      item.related_date ? formatCollectionsDateShort(item.related_date, locale) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="px-2 py-1 align-middle">
                <CardActionsMenu
                  ariaLabel={t.collections.cardActionsMenu}
                  actions={collectionItemTableMenuActions(
                    {
                      edit: t.collections.edit,
                      delete: t.collections.delete,
                    },
                    () => onEdit(item),
                    () => onDelete(item)
                  )}
                />
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

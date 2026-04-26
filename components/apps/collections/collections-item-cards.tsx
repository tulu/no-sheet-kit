"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CardActionsMenu,
  type CardActionsMenuItem,
} from "@/components/common/card-actions-menu";
import {
  semanticBadgeOutlineClass,
  semanticToTone,
  type BadgeTone,
} from "@/components/common/semantic-badge";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n/types";
import type { NSKCollectionItem } from "@/lib/collections/schema";
import {
  formatCollectionPrice,
  formatCollectionsDateLong,
  itemLinkHref,
  lendingRelatedStatuses,
} from "@/lib/collections/collections-helpers";
import { cn } from "@/lib/utils";

export type CollectionsItemCardsProps = {
  items: NSKCollectionItem[];
  locale: Locale;
  showPrice: boolean;
  showLink: boolean;
  onEdit: (item: NSKCollectionItem) => void;
  onDelete: (item: NSKCollectionItem) => void;
  showPossessionBadge?: boolean;
  getCollectionLabel?: (item: NSKCollectionItem) => string | undefined;
};

const TONE_TOP_ACCENT: Record<BadgeTone, string> = {
  emerald: "bg-emerald-500",
  neutral: "bg-muted-foreground/45",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  blue: "bg-blue-500",
  pink: "bg-pink-500",
  violet: "bg-violet-500",
  slate: "bg-slate-500",
  teal: "bg-teal-500",
};

function lendingSentence(
  item: NSKCollectionItem,
  locale: Locale,
  card: {
    loanLentOutBoth: string;
    loanLentOutPerson: string;
    loanLentOutDate: string;
    loanBorrowedBoth: string;
    loanBorrowedPerson: string;
    loanBorrowedDate: string;
  }
): string | null {
  if (!lendingRelatedStatuses(item)) return null;
  const person = item.related_person?.trim() ?? "";
  const dateLong = item.related_date ? formatCollectionsDateLong(item.related_date, locale) : "";
  if (!person && !dateLong) return null;
  const borrowed = item.possession_status === "borrowed";
  if (borrowed) {
    if (person && dateLong) {
      return card.loanBorrowedBoth.replace("{person}", person).replace("{date}", dateLong);
    }
    if (person) return card.loanBorrowedPerson.replace("{person}", person);
    return card.loanBorrowedDate.replace("{date}", dateLong);
  }
  if (person && dateLong) {
    return card.loanLentOutBoth.replace("{person}", person).replace("{date}", dateLong);
  }
  if (person) return card.loanLentOutPerson.replace("{person}", person);
  return card.loanLentOutDate.replace("{date}", dateLong);
}

function itemMenuActions(
  labels: { edit: string; delete: string },
  onEdit: () => void,
  onDelete: () => void
): CardActionsMenuItem[] {
  return [
    { label: labels.edit, icon: Pencil, onSelect: onEdit },
    { label: labels.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
}

export function CollectionsItemCards({
  items,
  locale,
  showPrice,
  showLink,
  onEdit,
  onDelete,
  showPossessionBadge = true,
  getCollectionLabel,
}: CollectionsItemCardsProps) {
  const { t } = useI18n();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const collectionLine = getCollectionLabel?.(item)?.trim();
        const hasNotes = Boolean(item.notes?.trim());
        const loanLine = lendingSentence(item, locale, t.collections.card);
        const tone = semanticToTone(item.possession_status);
        const showPriceChip = showPrice && item.price != null;
        const openHref = showLink ? itemLinkHref(item.link) : null;

        return (
          <li key={item.id}>
            <Card
              className={cn(
                "flex h-full flex-col overflow-hidden border border-border/70 gap-0 py-0",
                !loanLine && !hasNotes && "pb-4"
              )}
            >
              <div
                className={cn("h-1 w-full shrink-0", TONE_TOP_ACCENT[tone])}
                aria-hidden
              />
              <CardHeader className="gap-0 rounded-none px-4 pb-0 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                      <CardTitle className="line-clamp-2 min-w-0 max-w-full text-base font-semibold leading-snug text-foreground">
                        {item.name}
                      </CardTitle>
                      {openHref ? (
                        <a
                          href={openHref}
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
                      {showPossessionBadge ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 font-medium",
                            semanticBadgeOutlineClass(item.possession_status)
                          )}
                        >
                          {t.collections.possessionLabels[item.possession_status]}
                        </Badge>
                      ) : null}
                      {showPriceChip && item.price != null ? (
                        <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                          {formatCollectionPrice(item.price, item.currency, locale)}
                        </span>
                      ) : null}
                    </div>
                    {collectionLine ? (
                      <p className="truncate text-xs text-muted-foreground" title={collectionLine}>
                        {collectionLine}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0">
                    <CardActionsMenu
                      ariaLabel={t.collections.cardActionsMenu}
                      actions={itemMenuActions(
                        { edit: t.collections.edit, delete: t.collections.delete },
                        () => onEdit(item),
                        () => onDelete(item)
                      )}
                    />
                  </div>
                </div>
              </CardHeader>
              {hasNotes ? (
                <CardContent className="flex flex-1 flex-col px-4 pt-2 pb-4">
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {item.notes!.trim()}
                  </p>
                </CardContent>
              ) : null}
              {loanLine ? (
                <CardFooter className="mt-auto flex-col items-stretch gap-0 border-t py-3">
                  <p className="text-sm leading-snug text-muted-foreground">{loanLine}</p>
                </CardFooter>
              ) : null}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

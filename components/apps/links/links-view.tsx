"use client";

import {
  CalendarCheck2,
  CalendarClock,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Pencil,
  RefreshCcw,
  Trash2,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardActionsMenu, type CardActionsMenuItem } from "@/components/common/card-actions-menu";
import {
  formatDateShort,
  linkCardSiteLabel,
  linkCardSourceTitle,
  linkDisplayTitle,
  linkFaviconSources,
} from "@/lib/links/links-helpers";
import type { LinksViewMode, NSKLinkItem } from "@/lib/links/schema";
import type { Locale } from "@/lib/i18n/types";

const LINK_CARD_HERO_H = "h-36";

function ReviewedCornerBadge({ reviewedLabel }: { reviewedLabel: string }) {
  return (
    <span
      className="pointer-events-none absolute right-2 top-2 inline-flex items-center justify-center rounded-full border border-emerald-300/70 bg-emerald-900/90 p-1 text-emerald-50 shadow-md backdrop-blur-sm"
      title={reviewedLabel}
      aria-label={reviewedLabel}
    >
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
    </span>
  );
}

/** OG image when available, same-height placeholder otherwise; on load error falls back to placeholder. */
function LinkCardHero({
  imageUrl,
  reviewed,
  reviewedLabel,
  reviewDueLabel,
}: {
  imageUrl?: string;
  reviewed: boolean;
  reviewedLabel: string;
  reviewDueLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl?.trim()) && !failed;

  return (
    <div
      data-slot="link-card-hero"
      className={`relative isolate w-full shrink-0 overflow-hidden border-b border-border/60 bg-muted/35 ${LINK_CARD_HERO_H}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- external OG images are dynamic by URL
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={`flex ${LINK_CARD_HERO_H} w-full items-center justify-center text-muted-foreground/40`}
          aria-hidden
        >
          <ImageIcon className="size-12 stroke-[1.25]" aria-hidden />
        </div>
      )}
      {reviewed ? <ReviewedCornerBadge reviewedLabel={reviewedLabel} /> : null}
      {!reviewed && reviewDueLabel ? (
        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-emerald-300/70 bg-emerald-900/90 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-50 shadow-md backdrop-blur-sm">
          <CalendarClock className="size-3" aria-hidden />
          <span>{reviewDueLabel}</span>
        </span>
      ) : null}
    </div>
  );
}

function LinkFaviconImage({ url, faviconUrl, className = "size-8" }: { url: string; faviconUrl?: string; className?: string }) {
  const sources = linkFaviconSources(url, faviconUrl);
  const [idx, setIdx] = useState(0);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- favicon sources are dynamic external URLs
    <img
      src={sources[idx]}
      alt=""
      aria-hidden
      width={24}
      height={24}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setIdx((current) => Math.min(current + 1, sources.length - 1))}
    />
  );
}

function linkActions(
  item: NSKLinkItem,
  labels: {
    edit: string;
    delete: string;
    refresh: string;
    open: string;
    markReviewed: string;
    markUnreviewed: string;
  },
  onEdit: () => void,
  onDelete: () => void,
  onRefresh: () => void,
  onToggleReviewed: () => void
): CardActionsMenuItem[] {
  const actions: CardActionsMenuItem[] = [
    item.reviewed
      ? { label: labels.markUnreviewed, icon: Undo2, onSelect: onToggleReviewed }
      : { label: labels.markReviewed, icon: Check, onSelect: onToggleReviewed },
    { label: labels.edit, icon: Pencil, onSelect: onEdit },
    { label: labels.refresh, icon: RefreshCcw, onSelect: onRefresh },
    { label: labels.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
  if (item.url) {
    actions.unshift({
      label: labels.open,
      icon: ExternalLink,
      onSelect: () => {
        window.open(item.url, "_blank", "noopener,noreferrer");
      },
    });
  }
  return actions;
}

export type LinksViewProps = {
  items: NSKLinkItem[];
  viewMode: LinksViewMode;
  locale: Locale;
  onEdit: (item: NSKLinkItem) => void;
  onDelete: (item: NSKLinkItem) => void;
  onToggleReviewed: (item: NSKLinkItem, next: boolean) => void;
  onRefreshMetadata: (item: NSKLinkItem) => void;
};

export function LinksView({
  items,
  viewMode,
  locale,
  onEdit,
  onDelete,
  onToggleReviewed,
  onRefreshMetadata,
}: LinksViewProps) {
  const { t } = useI18n();

  function renderGrid() {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          return (
            <li key={item.id}>
              <Card className="h-full border border-border/70 gap-0 py-0 pb-4">
                <LinkCardHero
                  imageUrl={item.image_url}
                  reviewed={item.reviewed}
                  reviewedLabel={t.links.reviewedBadge}
                  reviewDueLabel={
                    !item.reviewed && item.review_due_date
                      ? `${t.links.cardReviewOn}: ${formatDateShort(`${item.review_due_date}T00:00:00`, locale)}`
                      : undefined
                  }
                />
                <CardHeader className="gap-2 rounded-none px-4 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <LinkFaviconImage url={item.url} faviconUrl={item.favicon_url} className="size-6 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="line-clamp-2 text-base">{linkDisplayTitle(item)}</CardTitle>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.google_calendar_event_id ? (
                        <span
                          className="inline-flex items-center rounded-full bg-emerald-500/12 p-1 text-emerald-600 dark:text-emerald-400"
                          title={t.googleCalendar.linkedBadge}
                          aria-label={t.googleCalendar.linkedBadge}
                        >
                          <CalendarCheck2 className="size-3.5" aria-hidden />
                        </span>
                      ) : null}
                      <CardActionsMenu
                        ariaLabel={t.links.cardActionsMenu}
                        actions={linkActions(
                          item,
                          {
                            edit: t.links.edit,
                            delete: t.links.delete,
                            refresh: t.links.refreshMetadata,
                            open: t.links.openLink,
                            markReviewed: t.links.markReviewed,
                            markUnreviewed: t.links.markUnreviewed,
                          },
                          () => onEdit(item),
                          () => onDelete(item),
                          () => onRefreshMetadata(item),
                          () => onToggleReviewed(item, !item.reviewed)
                        )}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-0 pt-3">
                  {item.description ? (
                    <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                  ) : null}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="min-w-0 truncate text-xs text-muted-foreground"
                      title={`${linkCardSourceTitle(item)} · ${t.links.cardAddedOn}: ${formatDateShort(item.created_at, locale)}`}
                    >
                      <span>
                        {`${linkCardSiteLabel(item) || "—"} · ${t.links.cardAddedOn}: ${formatDateShort(item.created_at, locale)}`}
                      </span>
                      {item.google_calendar_event_id ? (
                        <CalendarCheck2
                          className="ml-1 inline size-3.5 shrink-0 align-text-bottom text-muted-foreground"
                          aria-label={t.googleCalendar.linkedBadge}
                        />
                      ) : null}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderTable() {
    return (
      <div className="rounded-lg border border-border">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.links.table.title}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.links.table.site}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.links.table.addedOn}
              </TableHead>
              <TableHead className="w-10 px-2 py-2">
                <span className="sr-only">{t.links.cardActionsMenu}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              return (
                <TableRow key={item.id} className="hover:bg-muted/20">
                  <TableCell className="max-w-[280px] px-3 py-2 font-medium text-foreground">
                    <div className="flex min-w-0 items-center gap-2">
                      <LinkFaviconImage url={item.url} faviconUrl={item.favicon_url} className="size-6 shrink-0" />
                      <div className="min-w-0">
                      <p className="truncate">{linkDisplayTitle(item)}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.url}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{item.hostname ?? "—"}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      {formatDateShort(item.created_at, locale)}
                      {item.google_calendar_event_id ? (
                        <CalendarCheck2
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-label={t.googleCalendar.linkedBadge}
                        />
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-1 align-middle">
                    <CardActionsMenu
                      ariaLabel={t.links.cardActionsMenu}
                      actions={linkActions(
                        item,
                        {
                          edit: t.links.edit,
                          delete: t.links.delete,
                          refresh: t.links.refreshMetadata,
                          open: t.links.openLink,
                          markReviewed: t.links.markReviewed,
                          markUnreviewed: t.links.markUnreviewed,
                        },
                        () => onEdit(item),
                        () => onDelete(item),
                        () => onRefreshMetadata(item),
                        () => onToggleReviewed(item, !item.reviewed)
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

  if (viewMode === "grid") return renderGrid();
  return renderTable();
}

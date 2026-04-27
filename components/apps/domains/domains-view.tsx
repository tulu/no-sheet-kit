"use client";

import { useState } from "react";
import { CalendarCheck2, ExternalLink, Pencil, RefreshCw, Trash2 } from "lucide-react";
import type { DomainsViewMode, NSKDomainItem } from "@/lib/domains/schema";
import {
  domainFaviconSources,
  getDaysUntilExpiry,
  getDomainItemsForExpiryDay,
  isExpiringSoon,
  normalizeDomainSiteUrl,
} from "@/lib/domains/domains-helpers";
import type { Locale } from "@/lib/i18n/types";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  CardActionsMenu,
  type CardActionsMenuItem,
} from "@/components/common/card-actions-menu";
import { MonthGridCalendar } from "@/components/common/month-grid-calendar";
import {
  semanticBadgeOutlineClass,
  semanticToTone,
  type BadgeTone,
} from "@/components/common/semantic-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function DomainFaviconImage({
  domainName,
  className,
}: {
  domainName: string;
  className?: string;
}) {
  const sources = domainFaviconSources(domainName);
  const [sourceIndex, setSourceIndex] = useState(0);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- dynamic favicon hosts; chain uses plain img
    <img
      src={sources[sourceIndex]}
      alt=""
      aria-hidden
      width={32}
      height={32}
      className={className ?? "size-6"}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        setSourceIndex((current) => Math.min(current + 1, sources.length - 1));
      }}
    />
  );
}

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

function domainCardMenuActions(
  item: NSKDomainItem,
  td: { viewSite: string; edit: string; delete: string },
  onEdit: () => void,
  onDelete: () => void
): CardActionsMenuItem[] {
  return [
    {
      label: td.viewSite,
      icon: ExternalLink,
      onSelect: () => {
        const url = normalizeDomainSiteUrl(item.domain_name);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    { label: td.edit, icon: Pencil, onSelect: onEdit },
    { label: td.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
}

function parseISODate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateShort(iso: string, locale: Locale): string {
  const d = parseISODate(iso);
  if (!d) return iso.trim() ? iso : "—";
  return d.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPurchasedAt(iso: string, locale: Locale): string {
  if (!iso.trim()) return "—";
  return formatDateShort(iso, locale);
}

export type DomainsViewProps = {
  items: NSKDomainItem[];
  viewMode: DomainsViewMode;
  locale: Locale;
  calendarMonth: Date;
  onCalendarMonthChange: (month: Date) => void;
  onEdit: (item: NSKDomainItem) => void;
  onDelete: (item: NSKDomainItem) => void;
};

export function DomainsView({
  items,
  viewMode,
  locale,
  calendarMonth,
  onCalendarMonthChange,
  onEdit,
  onDelete,
}: DomainsViewProps) {
  const { t } = useI18n();

  function renderGrid() {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const daysLeft = getDaysUntilExpiry(item.expires_on);
          const expiringSoon = isExpiringSoon(item.expires_on);
          const expired = daysLeft !== null && daysLeft < 0;
          const urgentFooter = expiringSoon || expired;

          let countdownLabel: string;
          if (daysLeft === null) {
            countdownLabel = "—";
          } else if (expired) {
            countdownLabel = t.domains.cardExpired;
          } else if (daysLeft === 0) {
            countdownLabel = t.domains.cardExpiresToday;
          } else {
            countdownLabel = t.domains.cardDaysLeft.replace("{count}", String(daysLeft));
          }

          return (
            <li
              key={item.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              )}
            >
              <div
                className={cn("h-1 w-full shrink-0", TONE_TOP_ACCENT[semanticToTone(item.status_id)])}
                aria-hidden
              />

              <div className="flex flex-1 flex-col p-4">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center" aria-hidden>
                    <DomainFaviconImage domainName={item.domain_name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold leading-tight text-foreground">
                          {item.domain_name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.registrar.trim() || "—"}
                        </p>
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
                          ariaLabel={t.domains.cardActionsMenu}
                          actions={domainCardMenuActions(item, t.domains, () => onEdit(item), () =>
                            onDelete(item)
                          )}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={cn("font-medium", semanticBadgeOutlineClass(item.status_id))}
                      >
                        {t.domains.types[item.status_id]}
                      </Badge>
                      {item.auto_renew ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <RefreshCw className="size-3.5 shrink-0" aria-hidden />
                          {t.domains.cardAuto}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3 pt-3 text-sm">
                  <p className="min-w-0 text-muted-foreground">
                    <span>{t.domains.cardExpiresLabel}:</span>{" "}
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      {formatDateShort(item.expires_on, locale)}
                      {item.google_calendar_event_id ? (
                        <CalendarCheck2
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-label={t.googleCalendar.linkedBadge}
                        />
                      ) : null}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "shrink-0 tabular-nums",
                      urgentFooter ? "font-medium text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {countdownLabel}
                  </p>
                </div>
                {item.price.trim() || item.notes?.trim() ? (
                  <div className="mt-3 space-y-1 pt-3 text-xs text-muted-foreground">
                    {item.price.trim() ? (
                      <p className="truncate">
                        <span className="text-foreground/80">{t.domains.fields.price}:</span>{" "}
                        {item.price.trim()}
                      </p>
                    ) : null}
                    {item.notes?.trim() ? (
                      <p className="line-clamp-2 whitespace-pre-wrap">{item.notes}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderTable() {
    return (
      <div className="rounded-lg border border-border">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.domains.fields.domainName}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.domains.fields.registrar}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.domains.fields.purchasedAt}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.domains.fields.expiresOn}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.domains.fields.status}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.domains.fields.autoRenew}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.domains.fields.price}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.domains.fields.notes}
              </TableHead>
              <TableHead className="w-10 px-2 py-2">
                <span className="sr-only">{t.domains.cardActionsMenu}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/20">
                <TableCell className="max-w-[180px] px-3 py-2 font-medium text-foreground">
                  <div className="flex min-w-0 items-center gap-2">
                    <DomainFaviconImage domainName={item.domain_name} className="size-6 shrink-0" />
                    <span className="truncate">{item.domain_name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[140px] truncate px-3 py-2 text-muted-foreground">
                  {item.registrar || "—"}
                </TableCell>
                <TableCell className="px-3 py-2 text-muted-foreground">
                  {formatPurchasedAt(item.purchased_at, locale)}
                </TableCell>
                <TableCell className="px-3 py-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    {formatDateShort(item.expires_on, locale)}
                    {item.google_calendar_event_id ? (
                      <CalendarCheck2
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-label={t.googleCalendar.linkedBadge}
                      />
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Badge
                    variant="outline"
                    className={cn("font-medium", semanticBadgeOutlineClass(item.status_id))}
                  >
                    {t.domains.types[item.status_id]}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-2">{item.auto_renew ? "✓" : "—"}</TableCell>
                <TableCell className="max-w-[120px] truncate px-3 py-2 text-muted-foreground">
                  {item.price.trim() || "—"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                  {item.notes?.trim() || "—"}
                </TableCell>
                <TableCell className="px-2 py-1 align-middle">
                  <CardActionsMenu
                    ariaLabel={t.domains.cardActionsMenu}
                    actions={domainCardMenuActions(item, t.domains, () => onEdit(item), () =>
                      onDelete(item)
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderCalendar() {
    return (
      <MonthGridCalendar<NSKDomainItem>
        locale={locale}
        month={calendarMonth}
        onMonthChange={onCalendarMonthChange}
        regionAriaLabel={t.domains.calendarMonthNav}
        prevMonthAriaLabel={t.domains.calendarPrevMonth}
        nextMonthAriaLabel={t.domains.calendarNextMonth}
        getItemsForDay={(day) => getDomainItemsForExpiryDay(items, day)}
        getItemKey={(item) => item.id}
        renderItem={(item) => (
          <Badge
            variant="outline"
            render={<button type="button" />}
            title={item.domain_name}
            onClick={() => onEdit(item)}
            className={cn(
              "h-auto min-h-5 w-full max-w-full justify-start truncate py-0.5 text-left text-[11px] font-medium leading-tight sm:text-xs",
              semanticBadgeOutlineClass(item.status_id)
            )}
          >
            {item.domain_name}
          </Badge>
        )}
      />
    );
  }

  function renderItemsForView() {
    switch (viewMode) {
      case "grid":
        return renderGrid();
      case "list":
        return renderTable();
      case "calendar":
        return renderCalendar();
    }
  }

  return renderItemsForView();
}

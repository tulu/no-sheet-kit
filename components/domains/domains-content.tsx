"use client";

import { Globe, RefreshCw } from "lucide-react";
import type { DomainStatusId, DomainsViewMode, NSKDomainItem } from "@/lib/domains/schema";
import { getDaysUntilExpiry, isExpiringSoon } from "@/lib/domains/expiry";
import type { Locale } from "@/lib/i18n/types";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { DomainCardActions } from "./domain-card-actions";

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

function statusPillClass(statusId: DomainStatusId): string {
  switch (statusId) {
    case "active":
      return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "parked":
      return "border border-border bg-muted/60 text-muted-foreground";
    case "for_sale":
      return "border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-400";
    case "abandoned":
      return "border border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300";
  }
}

type DomainsContentProps = {
  items: NSKDomainItem[];
  viewMode: DomainsViewMode;
  locale: Locale;
  onEdit: (item: NSKDomainItem) => void;
  onDelete: (item: NSKDomainItem) => void;
};

export function DomainsContent({
  items,
  viewMode,
  locale,
  onEdit,
  onDelete,
}: DomainsContentProps) {
  const { t } = useI18n();

  if (viewMode === "grid") {
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
                "flex flex-col rounded-xl border bg-card p-4 shadow-sm",
                urgentFooter ? "border-destructive" : "border-border"
              )}
            >
              <div className="flex gap-3">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50"
                  aria-hidden
                >
                  <Globe className="size-4 text-muted-foreground" />
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
                    <DomainCardActions
                      domainName={item.domain_name}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusPillClass(item.status_id)
                      )}
                    >
                      {t.domains.types[item.status_id]}
                    </span>
                    {item.auto_renew ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <RefreshCw className="size-3.5 shrink-0" aria-hidden />
                        {t.domains.cardAuto}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/80 pt-3 text-sm">
                <p className="min-w-0 text-muted-foreground">
                  <span>{t.domains.cardExpiresLabel}:</span>{" "}
                  <span className="font-medium text-foreground">
                    {formatDateShort(item.expires_on, locale)}
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
                <div className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
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
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2">{t.domains.fields.domainName}</th>
            <th className="px-3 py-2">{t.domains.fields.registrar}</th>
            <th className="px-3 py-2">{t.domains.fields.purchasedAt}</th>
            <th className="px-3 py-2">{t.domains.fields.expiresOn}</th>
            <th className="px-3 py-2">{t.domains.fields.status}</th>
            <th className="px-3 py-2">{t.domains.fields.autoRenew}</th>
            <th className="px-3 py-2">{t.domains.fields.price}</th>
            <th className="px-3 py-2">{t.domains.fields.notes}</th>
            <th className="w-10 px-2 py-2" aria-label={t.domains.cardActionsMenu} />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="max-w-[180px] truncate px-3 py-2 font-medium text-foreground">
                {item.domain_name}
              </td>
              <td className="max-w-[140px] truncate px-3 py-2 text-muted-foreground">
                {item.registrar || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                {formatPurchasedAt(item.purchased_at, locale)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                {formatDateShort(item.expires_on, locale)}
              </td>
              <td className="whitespace-nowrap px-3 py-2">{t.domains.types[item.status_id]}</td>
              <td className="px-3 py-2">{item.auto_renew ? "✓" : "—"}</td>
              <td className="max-w-[120px] truncate px-3 py-2 text-muted-foreground">
                {item.price.trim() || "—"}
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                {item.notes?.trim() || "—"}
              </td>
              <td className="px-2 py-1 align-middle">
                <DomainCardActions
                  domainName={item.domain_name}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

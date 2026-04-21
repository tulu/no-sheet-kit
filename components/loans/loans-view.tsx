"use client";

import { List, Pencil, PlusCircle, Trash2 } from "lucide-react";
import type { LoansViewMode, NSKLoanItem } from "@/lib/loans/schema";
import {
  formatLoanNumber,
  isLoanActive,
  outstandingBalance,
  parseAmount,
  statusSemantic,
} from "@/lib/loans/loans-helpers";
import type { Locale } from "@/lib/i18n/types";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  CardActionsMenu,
  type CardActionsMenuItem,
} from "@/components/common/card-actions-menu";
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

const AMOUNT_EPSILON = 0.009;

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

/** Positive = they owe you (lent outstanding); negative = you owe them (borrowed outstanding). */
function signedNetOutstanding(loan: NSKLoanItem): number {
  const out = outstandingBalance(loan);
  return loan.direction === "lent" ? out : -out;
}

function formatSignedLoanBalance(value: number, currency: string, locale: Locale): string {
  const cur = currency.trim().toUpperCase() || "—";
  const abs = formatLoanNumber(Math.abs(value), locale);
  if (Math.abs(value) <= AMOUNT_EPSILON) return `${cur} ${abs}`;
  const sign = value > 0 ? "+" : "−";
  return `${sign}${cur} ${abs}`;
}

function formatDateShort(iso: string, locale: Locale): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.trim() ? iso : "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function moneyLabel(currency: string, value: number, locale: Locale): string {
  const c = currency.trim().toUpperCase() || "—";
  return `${c} ${formatLoanNumber(value, locale)}`;
}

function loanCardMenuActions(
  item: NSKLoanItem,
  labels: {
    edit: string;
    delete: string;
    viewPayments: string;
    addPayment: string;
  },
  onEdit: () => void,
  onDelete: () => void,
  onViewPayments: () => void,
  onAddPayment: () => void
): CardActionsMenuItem[] {
  const actions: CardActionsMenuItem[] = [
    { label: labels.edit, icon: Pencil, onSelect: onEdit },
    { label: labels.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
  if (item.payments.length > 0) {
    actions.push({ label: labels.viewPayments, icon: List, onSelect: onViewPayments });
  }
  if (isLoanActive(item)) {
    actions.push({ label: labels.addPayment, icon: PlusCircle, onSelect: onAddPayment });
  }
  return actions;
}

export type LoansViewProps = {
  items: NSKLoanItem[];
  viewMode: LoansViewMode;
  locale: Locale;
  onEdit: (item: NSKLoanItem) => void;
  onDelete: (item: NSKLoanItem) => void;
  onAddPayment: (item: NSKLoanItem) => void;
  onViewPayments: (item: NSKLoanItem) => void;
};

export function LoansView({
  items,
  viewMode,
  locale,
  onEdit,
  onDelete,
  onAddPayment,
  onViewPayments,
}: LoansViewProps) {
  const { t } = useI18n();

  function renderGrid() {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const active = isLoanActive(item);
          const loanAmountNum = parseAmount(item.amount);
          const signed = signedNetOutstanding(item);
          const balanceTone =
            Math.abs(signed) <= AMOUNT_EPSILON
              ? "text-muted-foreground"
              : signed > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400";
          let balanceCaption: string;
          if (!active) {
            balanceCaption = t.loans.statusSettled;
          } else if (signed > AMOUNT_EPSILON) {
            balanceCaption = t.loans.cardTheyOweYou;
          } else {
            balanceCaption = t.loans.cardYouOweThem;
          }

          return (
            <li
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-card shadow-sm dark:border-zinc-800/90 dark:bg-zinc-950/40"
            >
              <div
                className={cn("h-1 w-full shrink-0", TONE_TOP_ACCENT[semanticToTone(statusSemantic(item))])}
                aria-hidden
              />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center overflow-hidden">
                    <div className="flex min-w-0 max-w-full items-center gap-2">
                      <p className="min-w-0 truncate font-semibold leading-tight text-foreground">
                        {item.counterparty_name}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 font-medium", semanticBadgeOutlineClass(statusSemantic(item)))}
                      >
                        {active ? t.loans.statusActive : t.loans.statusSettled}
                      </Badge>
                    </div>
                  </div>
                  <CardActionsMenu
                    ariaLabel={t.loans.cardActionsMenu}
                    actions={loanCardMenuActions(
                      item,
                      {
                        edit: t.loans.edit,
                        delete: t.loans.delete,
                        viewPayments: t.loans.viewPayments,
                        addPayment: t.loans.addPayment,
                      },
                      () => onEdit(item),
                      () => onDelete(item),
                      () => onViewPayments(item),
                      () => onAddPayment(item)
                    )}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{formatDateShort(item.date, locale)}</p>
                <div className="mt-5 flex min-h-0 min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className={cn("text-3xl font-bold tracking-tight tabular-nums", balanceTone)}>
                    {formatSignedLoanBalance(signed, item.currency, locale)}
                  </p>
                  <p className="text-right text-sm text-muted-foreground">{balanceCaption}</p>
                </div>
                <dl className="mt-2 space-y-1.5 pt-4 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{t.loans.cardAmount}</dt>
                    <dd className="tabular-nums text-foreground/90">
                      {moneyLabel(item.currency, loanAmountNum, locale)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 text-muted-foreground">
                    <dt>{t.loans.table.payments}</dt>
                    <dd className="tabular-nums">{t.loans.cardPaymentCount.replace("{count}", String(item.payments.length))}</dd>
                  </div>
                </dl>
                {item.notes?.trim() ? (
                  <p className="mt-3 line-clamp-3 border-t border-border/70 pt-3 text-xs whitespace-pre-wrap text-muted-foreground">
                    {item.notes}
                  </p>
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
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.loans.table.counterparty}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.loans.table.direction}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.loans.table.status}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.loans.table.currency}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.loans.table.amount}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.loans.table.outstanding}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.loans.table.date}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.loans.table.payments}
              </TableHead>
              <TableHead className="w-10 px-2 py-2">
                <span className="sr-only">{t.loans.cardActionsMenu}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const out = outstandingBalance(item);
              const loanAmountNum = parseAmount(item.amount);
              const cur = item.currency.trim().toUpperCase() || "—";
              return (
                <TableRow key={item.id} className="hover:bg-muted/20">
                  <TableCell className="max-w-[160px] px-3 py-2 font-medium text-foreground">
                    <span className="truncate">{item.counterparty_name}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm text-muted-foreground">
                    {item.direction === "lent" ? t.loans.directionLent : t.loans.directionBorrowed}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={cn("font-medium", semanticBadgeOutlineClass(statusSemantic(item)))}
                    >
                      {isLoanActive(item) ? t.loans.statusActive : t.loans.statusSettled}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{cur}</TableCell>
                  <TableCell className="px-3 py-2 tabular-nums text-muted-foreground">
                    {formatLoanNumber(loanAmountNum, locale)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-3 py-2 tabular-nums font-medium",
                      !isLoanActive(item)
                        ? "text-muted-foreground"
                        : item.direction === "lent"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {formatLoanNumber(out, locale)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">
                    {formatDateShort(item.date, locale)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{item.payments.length}</TableCell>
                  <TableCell className="px-2 py-1 align-middle">
                    <CardActionsMenu
                      ariaLabel={t.loans.cardActionsMenu}
                      actions={loanCardMenuActions(
                        item,
                        {
                          edit: t.loans.edit,
                          delete: t.loans.delete,
                          viewPayments: t.loans.viewPayments,
                          addPayment: t.loans.addPayment,
                        },
                        () => onEdit(item),
                        () => onDelete(item),
                        () => onViewPayments(item),
                        () => onAddPayment(item)
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

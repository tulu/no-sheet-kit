"use client";

import { List, Pencil, PlusCircle, Trash2 } from "lucide-react";
import type { EventsExpensesViewMode, NSKEventExpense } from "@/lib/events/schema";
import {
  expenseCurrency,
  expensePaidAmount,
  expensePendingAmount,
  expenseStatusSemantic,
  formatEventMoneyLabel,
  isExpenseFullyPaid,
} from "@/lib/events/events-helpers";
import { formatLoanNumber, parseAmount } from "@/lib/loans/loans-helpers";
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

function expenseCardMenuActions(
  expense: NSKEventExpense,
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
  if (expense.payments.length > 0) {
    actions.push({ label: labels.viewPayments, icon: List, onSelect: onViewPayments });
  }
  if (!isExpenseFullyPaid(expense)) {
    actions.push({ label: labels.addPayment, icon: PlusCircle, onSelect: onAddPayment });
  }
  return actions;
}

export type EventsExpensesViewProps = {
  expenses: NSKEventExpense[];
  viewMode: EventsExpensesViewMode;
  locale: Locale;
  onEdit: (expense: NSKEventExpense) => void;
  onDelete: (expense: NSKEventExpense) => void;
  onViewPayments: (expense: NSKEventExpense) => void;
  onAddPayment: (expense: NSKEventExpense) => void;
};

export function EventsExpensesView({
  expenses,
  viewMode,
  locale,
  onEdit,
  onDelete,
  onViewPayments,
  onAddPayment,
}: EventsExpensesViewProps) {
  const { t } = useI18n();

  function renderGrid() {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {expenses.map((expense) => {
          const currency = expenseCurrency(expense);
          const total = parseAmount(expense.total_amount);
          const pending = expensePendingAmount(expense);
          const fullyPaid = isExpenseFullyPaid(expense);
          const semantic = expenseStatusSemantic(expense);
          const pendingTone = fullyPaid
            ? "text-muted-foreground"
            : "text-amber-600 dark:text-amber-400";

          return (
            <li
              key={expense.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-card shadow-sm dark:border-zinc-800/90 dark:bg-zinc-950/40"
            >
              <div
                className={cn("h-1 w-full shrink-0", TONE_TOP_ACCENT[semanticToTone(semantic)])}
                aria-hidden
              />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center overflow-hidden">
                    <div className="flex min-w-0 max-w-full items-center gap-2">
                      <p className="min-w-0 truncate font-semibold leading-tight text-foreground">
                        {expense.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 font-medium", semanticBadgeOutlineClass(semantic))}
                      >
                        {fullyPaid ? t.events.expenses.statusPaid : t.events.expenses.statusPending}
                      </Badge>
                    </div>
                  </div>
                  <CardActionsMenu
                    ariaLabel={t.events.expenses.cardActionsMenu}
                    actions={expenseCardMenuActions(
                      expense,
                      {
                        edit: t.events.expenses.edit,
                        delete: t.events.expenses.delete,
                        viewPayments: t.events.expenses.viewPayments,
                        addPayment: t.events.expenses.addPayment,
                      },
                      () => onEdit(expense),
                      () => onDelete(expense),
                      () => onViewPayments(expense),
                      () => onAddPayment(expense)
                    )}
                  />
                </div>
                <div className="mt-5 flex min-h-0 min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className={cn("text-3xl font-bold tracking-tight tabular-nums", pendingTone)}>
                    {formatEventMoneyLabel(pending > AMOUNT_EPSILON ? pending : 0, currency, locale)}
                  </p>
                  <p className="text-right text-sm text-muted-foreground">
                    {fullyPaid ? t.events.expenses.cardFullyPaid : t.events.expenses.cardPendingCaption}
                  </p>
                </div>
                <dl className="mt-2 space-y-1.5 pt-4 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{t.events.expenses.total}</dt>
                    <dd className="tabular-nums text-foreground/90">
                      {formatEventMoneyLabel(total, currency, locale)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 text-muted-foreground">
                    <dt>{t.events.expenses.payments}</dt>
                    <dd className="tabular-nums">
                      {t.events.expenses.cardPaymentCount.replace(
                        "{count}",
                        String(expense.payments.length)
                      )}
                    </dd>
                  </div>
                </dl>
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
                {t.events.expenses.table.name}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.events.expenses.table.status}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.events.expenses.table.currency}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.events.expenses.table.total}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.events.expenses.table.paid}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.events.expenses.table.pending}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.events.expenses.table.payments}
              </TableHead>
              <TableHead className="w-10 px-2 py-2">
                <span className="sr-only">{t.events.expenses.cardActionsMenu}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
        {expenses.map((expense) => {
          const currency = expenseCurrency(expense);
          const total = parseAmount(expense.total_amount);
          const paid = expensePaidAmount(expense);
          const pending = expensePendingAmount(expense);
          const fullyPaid = isExpenseFullyPaid(expense);
              const semantic = expenseStatusSemantic(expense);

              return (
                <TableRow key={expense.id} className="hover:bg-muted/20">
                  <TableCell className="max-w-[180px] px-3 py-2 font-medium text-foreground">
                    <span className="truncate">{expense.name}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={cn("font-medium", semanticBadgeOutlineClass(semantic))}
                    >
                      {fullyPaid ? t.events.expenses.statusPaid : t.events.expenses.statusPending}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{currency}</TableCell>
                  <TableCell className="px-3 py-2 tabular-nums text-muted-foreground">
                    {formatLoanNumber(total, locale)}
                  </TableCell>
                  <TableCell className="px-3 py-2 tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatLoanNumber(paid, locale)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-3 py-2 tabular-nums font-medium",
                      fullyPaid ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {formatLoanNumber(pending, locale)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">
                    {expense.payments.length}
                  </TableCell>
                  <TableCell className="px-2 py-1 align-middle">
                    <CardActionsMenu
                      ariaLabel={t.events.expenses.cardActionsMenu}
                      actions={expenseCardMenuActions(
                        expense,
                        {
                          edit: t.events.expenses.edit,
                          delete: t.events.expenses.delete,
                          viewPayments: t.events.expenses.viewPayments,
                          addPayment: t.events.expenses.addPayment,
                        },
                        () => onEdit(expense),
                        () => onDelete(expense),
                        () => onViewPayments(expense),
                        () => onAddPayment(expense)
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

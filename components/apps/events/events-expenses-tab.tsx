"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Banknote, CircleCheck, Clock, LayoutGrid, List } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
import { ListSearchEmptyState } from "@/components/common/list-search-empty";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import { filterItemsBySearch } from "@/lib/apps/filter-items-by-search";
import { readAppViewBundlePreference, persistAppViewBundle } from "@/lib/apps/view-persistence";
import { kpiStatIconGlyphClass, kpiStatIconWrapClass } from "@/components/common/semantic-badge";
import type { BadgeTone } from "@/components/common/semantic-badge";
import { formatLoanNumber } from "@/lib/loans/loans-helpers";
import type { Locale } from "@/lib/i18n/types";
import {
  expenseMatchesSearch,
  expenseTotalsByCurrency,
  type ExpenseCurrencyTotals,
} from "@/lib/events/events-helpers";
import {
  EVENTS_EXPENSES_VIEW_MODES,
  type EventsExpensesViewMode,
  type NSKEventExpense,
} from "@/lib/events/schema";
import { cn } from "@/lib/utils";
import { EventsExpensesView } from "./events-expenses-view";

type EventsExpensesTabProps = {
  expenses: NSKEventExpense[];
  locale: Locale;
  onAddExpense: () => void;
  onEditExpense: (expense: NSKEventExpense) => void;
  onDeleteExpense: (expense: NSKEventExpense) => void;
  onViewPayments: (expense: NSKEventExpense) => void;
  onAddPayment: (expense: NSKEventExpense) => void;
};

type ExpenseSummaryStatCardProps = {
  icon: LucideIcon;
  title: string;
  tone: BadgeTone;
  valueClassName: string;
  children: ReactNode;
};

function ExpenseSummaryStatCard({
  icon: Icon,
  title,
  tone,
  valueClassName,
  children,
}: ExpenseSummaryStatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/90 bg-card p-4 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-950/50">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          kpiStatIconWrapClass(tone)
        )}
      >
        <Icon className={cn("size-5", kpiStatIconGlyphClass(tone))} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={cn("mt-1", valueClassName)}>{children}</div>
      </div>
    </div>
  );
}

function CurrencyAmountList({
  rows,
  locale,
  valueKey,
  valueClassName,
}: {
  rows: ExpenseCurrencyTotals[];
  locale: Locale;
  valueKey: "total" | "paid" | "pending";
  valueClassName: string;
}) {
  if (rows.length === 0) {
    return (
      <p className={cn("text-2xl font-semibold tracking-tight tabular-nums", valueClassName)}>
        {formatLoanNumber(0, locale)}
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {rows.map((row) => (
        <li key={row.currency} className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-muted-foreground">{row.currency}</span>
          <span className={cn("text-xl font-semibold tracking-tight tabular-nums", valueClassName)}>
            {formatLoanNumber(row[valueKey], locale)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function EventsExpensesTab({
  expenses,
  locale,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onViewPayments,
  onAddPayment,
}: EventsExpensesTabProps) {
  const { t } = useI18n();
  const totalsByCurrency = expenseTotalsByCurrency(expenses);
  const [viewMode, setViewMode] = useState<EventsExpensesViewMode>(() => {
    const stored = readAppViewBundlePreference("events_expenses", EVENTS_EXPENSES_VIEW_MODES);
    return stored ?? "grid";
  });
  const [expenseSearch, setExpenseSearch] = useState("");

  const filteredExpenses = filterItemsBySearch(expenses, expenseSearch, expenseMatchesSearch);

  function handleViewModeChange(next: EventsExpensesViewMode) {
    setViewMode(next);
    persistAppViewBundle("events_expenses", next);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <ExpenseSummaryStatCard
          icon={Banknote}
          title={t.events.expenses.total}
          tone="neutral"
          valueClassName="text-muted-foreground"
        >
          <CurrencyAmountList
            rows={totalsByCurrency}
            locale={locale}
            valueKey="total"
            valueClassName="text-muted-foreground"
          />
        </ExpenseSummaryStatCard>
        <ExpenseSummaryStatCard
          icon={CircleCheck}
          title={t.events.expenses.paid}
          tone="emerald"
          valueClassName="text-emerald-600 dark:text-emerald-400"
        >
          <CurrencyAmountList
            rows={totalsByCurrency}
            locale={locale}
            valueKey="paid"
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
        </ExpenseSummaryStatCard>
        <ExpenseSummaryStatCard
          icon={Clock}
          title={t.events.expenses.pending}
          tone="amber"
          valueClassName="text-amber-600 dark:text-amber-400"
        >
          <CurrencyAmountList
            rows={totalsByCurrency}
            locale={locale}
            valueKey="pending"
            valueClassName="text-amber-600 dark:text-amber-400"
          />
        </ExpenseSummaryStatCard>
      </div>

      <AppListToolbar<EventsExpensesViewMode>
        totalLabel={t.events.expenses.totalLabel.replace("{count}", String(filteredExpenses.length))}
        viewModes={[
          { id: "grid", icon: LayoutGrid, ariaLabel: t.events.expenses.viewGrid },
          { id: "list", icon: List, ariaLabel: t.events.expenses.viewList },
        ]}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        addButtonLabel={t.events.expenses.addExpense}
        onAdd={onAddExpense}
        search={{
          value: expenseSearch,
          onChange: setExpenseSearch,
          placeholder: t.events.expenses.searchPlaceholder,
          "aria-label": t.events.expenses.searchAriaLabel,
        }}
      />

      {expenses.length === 0 ? (
        <Empty className="border border-border p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Banknote />
            </EmptyMedia>
            <EmptyTitle className="text-xl font-semibold text-foreground">
              {t.events.expenses.emptyTitle}
            </EmptyTitle>
            <EmptyDescription>{t.events.info.widgets.emptyExpenses}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={onAddExpense}>
              {t.events.expenses.addExpense}
            </Button>
          </EmptyContent>
        </Empty>
      ) : filteredExpenses.length === 0 ? (
        <ListSearchEmptyState
          labels={{
            title: t.events.expenses.searchEmptyTitle,
            body: t.events.expenses.searchEmptyBody,
            clear: t.events.expenses.searchClear,
          }}
          onClear={() => setExpenseSearch("")}
        />
      ) : (
        <EventsExpensesView
          expenses={filteredExpenses}
          viewMode={viewMode}
          locale={locale}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
          onViewPayments={onViewPayments}
          onAddPayment={onAddPayment}
        />
      )}
    </div>
  );
}

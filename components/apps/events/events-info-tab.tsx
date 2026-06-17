"use client";

import type { ReactNode } from "react";
import { Banknote, ListTodo, Mail, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n/types";
import { eventDashboardStats, formatExpensePaidOfCaption } from "@/lib/events/events-helpers";
import type { NSKEventExpense, NSKEventFamily, NSKEventGuest } from "@/lib/events/schema";
import type { NSKTask } from "@/lib/tasks/schema";
import { cn } from "@/lib/utils";

type EventsInfoTabProps = {
  guests: NSKEventGuest[];
  families: NSKEventFamily[];
  tasks: NSKTask[];
  expenses: NSKEventExpense[];
  locale: Locale;
};

type BreakdownSegment = {
  value: number;
  className: string;
  label: string;
  displayValue?: string;
};

type WidgetCardProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
};

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function WidgetCard({ icon: Icon, title, children, className }: WidgetCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      <header className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        <h3>{title}</h3>
      </header>
      {children}
    </article>
  );
}

function StackedBar({ segments, total }: { segments: BreakdownSegment[]; total: number }) {
  if (total <= 0) {
    return <div className="h-3 w-full rounded-full bg-muted" aria-hidden />;
  }

  return (
    <div
      className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
      role="img"
      aria-hidden
    >
      {segments
        .filter((segment) => segment.value > 0)
        .map((segment) => (
          <div
            key={segment.label}
            className={cn("h-full min-w-0 transition-[width]", segment.className)}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
    </div>
  );
}

function BreakdownLegend({
  segments,
  total,
}: {
  segments: BreakdownSegment[];
  total: number;
}) {
  return (
    <ul className="space-y-2">
      {segments.map((segment) => (
        <li key={segment.label} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span className={cn("size-2.5 shrink-0 rounded-full", segment.className)} aria-hidden />
            <span className="truncate text-foreground">{segment.label}</span>
          </span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {segment.displayValue ?? segment.value}
            {total > 0 ? (
              <span className="ml-1.5 text-xs">({pct(segment.value, total)}%)</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function FractionHeadline({
  numerator,
  denominator,
  suffix,
}: {
  numerator: ReactNode;
  denominator: number;
  suffix?: string;
}) {
  return (
    <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
      {numerator}
      <span className="text-xl font-medium text-muted-foreground"> / {denominator}</span>
      {suffix ? <span className="ml-2 text-base font-normal text-muted-foreground">{suffix}</span> : null}
    </p>
  );
}

function ExpenseCurrencyBar({
  row,
  locale,
  paidOfTemplate,
}: {
  row: { currency: string; total: number; paid: number; pending: number };
  locale: Locale;
  paidOfTemplate: string;
}) {
  const segments: BreakdownSegment[] = [
    { value: row.paid, className: "bg-emerald-500", label: "paid" },
    { value: row.pending, className: "bg-amber-400", label: "pending" },
  ];

  const paidOfLine = formatExpensePaidOfCaption(row, locale, paidOfTemplate);

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{paidOfLine}</p>
      <StackedBar segments={segments} total={row.total} />
    </div>
  );
}

export function EventsInfoTab({ guests, families, tasks, expenses, locale }: EventsInfoTabProps) {
  const { t } = useI18n();
  const stats = eventDashboardStats(guests, families, tasks, expenses);

  const guestTotal = stats.guests.total;
  const rsvpSegments: BreakdownSegment[] = [
    {
      value: stats.guests.rsvpConfirmed,
      className: "bg-emerald-500",
      label: t.events.rsvp.confirmed,
    },
    {
      value: stats.guests.rsvpPending,
      className: "bg-amber-400",
      label: t.events.rsvp.pending,
    },
    {
      value: stats.guests.rsvpDeclined,
      className: "bg-rose-500",
      label: t.events.rsvp.declined,
    },
  ];

  const taskSegments: BreakdownSegment[] = [
    {
      value: stats.tasks.todo,
      className: "bg-slate-400",
      label: t.events.info.widgets.tasksTodo,
    },
    {
      value: stats.tasks.inProgress,
      className: "bg-blue-500",
      label: t.events.info.widgets.tasksInProgress,
    },
    {
      value: stats.tasks.done,
      className: "bg-emerald-500",
      label: t.events.info.widgets.tasksDone,
    },
  ];

  const expenseRows = stats.expenses.byCurrency;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <WidgetCard icon={Users} title={t.events.info.widgets.guestsTitle}>
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
            {guestTotal}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.events.info.widgets.guestsMeta
              .replace("{families}", String(stats.guests.families))
              .replace("{kids}", String(stats.guests.kids))}
          </p>
        </WidgetCard>

        <WidgetCard icon={Users} title={t.events.info.widgets.rsvpTitle}>
          {guestTotal === 0 ? (
            <p className="text-sm text-muted-foreground">{t.events.info.widgets.emptyGuests}</p>
          ) : (
            <>
              <StackedBar segments={rsvpSegments} total={guestTotal} />
              <BreakdownLegend segments={rsvpSegments} total={guestTotal} />
            </>
          )}
        </WidgetCard>

        <WidgetCard icon={Mail} title={t.events.info.widgets.invitationsTitle}>
          {guestTotal === 0 ? (
            <p className="text-sm text-muted-foreground">{t.events.info.widgets.emptyGuests}</p>
          ) : (
            <>
              <FractionHeadline
                numerator={stats.guests.invitationsSent}
                denominator={guestTotal}
              />
              <div className="space-y-2">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-[width]"
                    style={{ width: `${pct(stats.guests.invitationsSent, guestTotal)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.events.info.widgets.invitationsOf
                    .replace("{sent}", String(stats.guests.invitationsSent))
                    .replace("{total}", String(guestTotal))
                    .replace("{percent}", String(pct(stats.guests.invitationsSent, guestTotal)))}
                </p>
              </div>
            </>
          )}
        </WidgetCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WidgetCard icon={ListTodo} title={t.events.info.widgets.tasksTitle}>
          {stats.tasks.total === 0 ? (
            <p className="text-sm text-muted-foreground">{t.events.info.widgets.emptyTasks}</p>
          ) : (
            <>
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {t.events.info.widgets.tasksOpenOf
                  .replace("{pending}", String(stats.tasks.pending))
                  .replace("{total}", String(stats.tasks.total))}
              </p>
              <StackedBar segments={taskSegments} total={stats.tasks.total} />
              <BreakdownLegend segments={taskSegments} total={stats.tasks.total} />
            </>
          )}
        </WidgetCard>

        <WidgetCard icon={Banknote} title={t.events.info.widgets.expensesTitle}>
          {stats.expenses.count === 0 ? (
            <p className="text-sm text-muted-foreground">{t.events.info.widgets.emptyExpenses}</p>
          ) : (
            <>
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {t.events.info.widgets.expenseCountMeta.replace(
                  "{count}",
                  String(stats.expenses.count)
                )}
              </p>
              <ul className="space-y-4">
                {expenseRows.map((row) => (
                  <li key={row.currency}>
                    <ExpenseCurrencyBar
                      row={row}
                      locale={locale}
                      paidOfTemplate={t.events.info.widgets.expensesPaidOf}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </WidgetCard>
      </div>
    </div>
  );
}

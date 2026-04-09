"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getItemsForDay } from "@/lib/dates/calendar-occurrences";
import { getMonthGridDates } from "@/lib/dates/calendar-grid";
import { DATE_TYPE_CHIP_CLASS } from "./date-type-badge-classes";
import type { NSKDateItem } from "@/lib/dates/schema";
import {
  getCalendarWeekStartsOn,
  getIntlLocaleTag,
} from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DatesCalendarViewProps = {
  items: NSKDateItem[];
  locale: Locale;
  month: Date;
  onMonthChange: (month: Date) => void;
  onEdit: (item: NSKDateItem) => void;
};

function weekdayShortLabels(intlLocale: string, weekStartsOn: 0 | 1): string[] {
  const fmt = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
  const labels: string[] = [];
  const ref = new Date(2024, 0, 7);
  while (ref.getDay() !== weekStartsOn) {
    ref.setDate(ref.getDate() + 1);
  }
  for (let i = 0; i < 7; i++) {
    const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + i);
    labels.push(fmt.format(d));
  }
  return labels;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function DatesCalendarView({
  items,
  locale,
  month,
  onMonthChange,
  onEdit,
}: DatesCalendarViewProps) {
  const { t } = useI18n();
  const intlLocale = getIntlLocaleTag(locale);
  const weekStartsOn = getCalendarWeekStartsOn(locale);
  const grid = getMonthGridDates(month, weekStartsOn);
  const weekdayLabels = weekdayShortLabels(intlLocale, weekStartsOn);

  const y = month.getFullYear();
  const m = month.getMonth();
  const monthTitle = new Intl.DateTimeFormat(intlLocale, {
    month: "long",
    year: "numeric",
  }).format(new Date(y, m, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function goPrevMonth() {
    onMonthChange(new Date(y, m - 1, 1));
  }

  function goNextMonth() {
    onMonthChange(new Date(y, m + 1, 1));
  }

  return (
    <div
      className="flex w-full min-w-0 flex-col rounded-xl border border-border bg-card shadow-sm"
      role="region"
      aria-label={t.dates.calendarMonthNav}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-3 sm:px-4">
        <h2 className="min-w-0 text-lg font-semibold capitalize tracking-tight text-foreground sm:text-xl">
          {monthTitle}
        </h2>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={goPrevMonth}
            aria-label={t.dates.calendarPrevMonth}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={goNextMonth}
            aria-label={t.dates.calendarNextMonth}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-medium text-muted-foreground sm:text-sm">
        {weekdayLabels.map((label, i) => (
          <div key={i} className="border-r border-border py-2 last:border-r-0">
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-h-[min(70vh,52rem)] grid-cols-7 grid-rows-6 divide-x divide-y divide-border">
        {grid.map((day) => {
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const dayItems = getItemsForDay(items, day);
          const dom = day.getDate();

          return (
            <div
              key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
              className={cn(
                "flex min-h-0 min-w-0 flex-col bg-background p-1 sm:p-1.5",
                !inMonth && "bg-muted/20 text-muted-foreground",
                isToday && "bg-primary/5 ring-1 ring-inset ring-primary/25"
              )}
            >
              <div className="mb-1 flex justify-end">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-sm tabular-nums",
                    isToday &&
                      "bg-primary font-semibold text-primary-foreground sm:size-8 sm:text-base"
                  )}
                >
                  {dom}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
                {dayItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight sm:text-xs",
                      DATE_TYPE_CHIP_CLASS[item.type_id]
                    )}
                    title={item.label}
                    onClick={() => onEdit(item)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

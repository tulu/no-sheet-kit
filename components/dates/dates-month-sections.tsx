"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { DatesViewMode, NSKDateItem } from "@/lib/dates/schema";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";
import { DateCardActions } from "./date-card-actions";
import { DateTypeBadge } from "./date-type-badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type DatesMonthSectionsProps = {
  items: NSKDateItem[];
  viewMode: Exclude<DatesViewMode, "calendar">;
  locale: Locale;
  onEdit: (item: NSKDateItem) => void;
  onDelete: (item: NSKDateItem) => void;
};

const MONTH_INDEX_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

function monthName(locale: Locale, monthIndex: number): string {
  return new Intl.DateTimeFormat(getIntlLocaleTag(locale), { month: "long" }).format(
    new Date(2024, monthIndex, 1)
  );
}

function groupByCalendarMonth(items: NSKDateItem[]): Map<number, NSKDateItem[]> {
  const map = new Map<number, NSKDateItem[]>();
  for (const item of items) {
    const d = new Date(`${item.date}T00:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    const m = d.getMonth();
    if (!map.has(m)) map.set(m, []);
    map.get(m)!.push(item);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.date.localeCompare(b.date));
  }
  return map;
}

function formatDayMonthYear(locale: Locale, item: NSKDateItem): {
  dayMonth: string;
  year: string;
} {
  const d = new Date(`${item.date}T00:00:00`);
  const intl = getIntlLocaleTag(locale);
  const dayMonth = new Intl.DateTimeFormat(intl, {
    day: "numeric",
    month: "long",
  }).format(d);
  const year = new Intl.DateTimeFormat(intl, { year: "numeric" }).format(d);
  return { dayMonth, year };
}

type MonthBlockProps = {
  monthItems: NSKDateItem[];
  monthLabel: string;
  viewMode: Exclude<DatesViewMode, "calendar">;
  locale: Locale;
  onEdit: (item: NSKDateItem) => void;
  onDelete: (item: NSKDateItem) => void;
};

function MonthBlock({
  monthItems,
  monthLabel,
  viewMode,
  locale,
  onEdit,
  onDelete,
}: MonthBlockProps) {
  const { t } = useI18n();

  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{monthLabel}</h3>

      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1"
            : "flex flex-col gap-3"
        )}
      >
        {monthItems.map((item) => {
          const { dayMonth, year } = formatDayMonthYear(locale, item);
          return (
            <Card key={item.id}>
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <CardTitle className="text-lg leading-tight">{item.label}</CardTitle>
                    <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
                      <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                        {dayMonth}
                      </span>
                      <span className="text-xs text-muted-foreground">{year}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <DateTypeBadge typeId={item.type_id}>
                      {t.dates.types[item.type_id]}
                    </DateTypeBadge>
                    <DateCardActions
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function DatesMonthSections({
  items,
  viewMode,
  locale,
  onEdit,
  onDelete,
}: DatesMonthSectionsProps) {
  const { t } = useI18n();
  const [pastOpen, setPastOpen] = useState(false);

  const grouped = groupByCalendarMonth(items);
  const monthIndices = MONTH_INDEX_ORDER.filter((m) => (grouped.get(m)?.length ?? 0) > 0);

  const currentMonth = new Date().getMonth();
  const upcomingMonthIndices = monthIndices.filter((m) => m >= currentMonth);
  const pastMonthIndices = monthIndices.filter((m) => m < currentMonth);
  const showPastToggle = pastMonthIndices.length > 0 && currentMonth > 0;

  return (
    <div className="space-y-8">
      {upcomingMonthIndices.map((monthIndex) => (
        <MonthBlock
          key={monthIndex}
          monthItems={grouped.get(monthIndex)!}
          monthLabel={monthName(locale, monthIndex)}
          viewMode={viewMode}
          locale={locale}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {showPastToggle && (
        <div className="border-t border-border pt-6">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={pastOpen}
            onClick={() => setPastOpen((o) => !o)}
          >
            <ChevronDown
              className={cn("size-4 shrink-0 transition-transform", pastOpen && "rotate-180")}
              aria-hidden
            />
            {pastOpen ? t.dates.hidePastDates : t.dates.showPastDates}
          </button>
          {pastOpen && (
            <div className="mt-4 space-y-8">
              {pastMonthIndices.map((monthIndex) => (
                <MonthBlock
                  key={monthIndex}
                  monthItems={grouped.get(monthIndex)!}
                  monthLabel={monthName(locale, monthIndex)}
                  viewMode={viewMode}
                  locale={locale}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!showPastToggle &&
        pastMonthIndices.map((monthIndex) => (
          <MonthBlock
            key={monthIndex}
            monthItems={grouped.get(monthIndex)!}
            monthLabel={monthName(locale, monthIndex)}
            viewMode={viewMode}
            locale={locale}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}

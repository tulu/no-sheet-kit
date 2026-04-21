"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardActionsMenu, type CardActionsMenuItem } from "@/components/common/card-actions-menu";
import { MonthGridCalendar } from "@/components/common/month-grid-calendar";
import { semanticBadgeOutlineClass } from "@/components/common/semantic-badge";
import {
  getItemsForDay as getDateItemsForCalendarDay,
  isOccurrenceStrictlyPast,
  parseItemLocalDate,
  sortItemsByOccurrenceFromToday,
} from "@/lib/dates/dates-helpers";
import type { DatesViewMode, NSKDateItem } from "@/lib/dates/schema";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

function dateCardMenuActions(
  td: { edit: string; delete: string },
  onEdit: () => void,
  onDelete: () => void
): CardActionsMenuItem[] {
  return [
    { label: td.edit, icon: Pencil, onSelect: onEdit },
    { label: td.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
}

const MONTH_INDEX_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

function monthName(locale: Locale, monthIndex: number): string {
  return new Intl.DateTimeFormat(getIntlLocaleTag(locale), { month: "long" }).format(
    new Date(2024, monthIndex, 1)
  );
}

/** Within a named calendar month block, order by day-of-month (recurring-friendly), then full ISO date. */
function compareByDayOfMonthThenIsoDate(a: NSKDateItem, b: NSKDateItem): number {
  const da = parseItemLocalDate(a);
  const db = parseItemLocalDate(b);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  const byDom = da.getDate() - db.getDate();
  if (byDom !== 0) return byDom;
  return a.date.localeCompare(b.date);
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
    list.sort(compareByDayOfMonthThenIsoDate);
  }
  return map;
}

function formatDayMonthYear(
  locale: Locale,
  item: NSKDateItem
): {
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

/** Non-recurring dates in the future whose calendar month is before the current month (e.g. Jan 2027 while viewing April). */
function futureOneOffsAfterMainStrip(
  items: NSKDateItem[],
  now: Date,
  currentMonth: number
): NSKDateItem[] {
  return items
    .filter((item) => {
      if (item.is_recurring) return false;
      if (isOccurrenceStrictlyPast(item, now)) return false;
      const d = parseItemLocalDate(item);
      if (!d) return false;
      return d.getMonth() < currentMonth;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function formatDateShort(iso: string, locale: Locale): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.trim() ? iso : "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DatesListTableProps = {
  items: NSKDateItem[];
  locale: Locale;
  onEdit: (item: NSKDateItem) => void;
  onDelete: (item: NSKDateItem) => void;
};

function DatesListTable({ items, locale, onEdit, onDelete }: DatesListTableProps) {
  const { t } = useI18n();
  const rows = sortItemsByOccurrenceFromToday(items);

  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.dates.fields.label}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.dates.fields.date}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.dates.fields.type}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.dates.fields.recurring}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.dates.fields.notes}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{t.dates.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/20">
              <TableCell className="max-w-[200px] px-3 py-2 font-medium text-foreground">
                <div className="min-w-0 truncate">{item.label}</div>
              </TableCell>
              <TableCell className="px-3 py-2 text-muted-foreground">
                {formatDateShort(item.date, locale)}
              </TableCell>
              <TableCell className="px-3 py-2">
                <Badge
                  variant="outline"
                  className={cn("font-medium", semanticBadgeOutlineClass(item.type_id))}
                >
                  {t.dates.types[item.type_id]}
                </Badge>
              </TableCell>
              <TableCell className="px-3 py-2">{item.is_recurring ? "✓" : "—"}</TableCell>
              <TableCell className="max-w-[220px] truncate px-3 py-2 text-muted-foreground">
                {item.notes?.trim() || "—"}
              </TableCell>
              <TableCell className="px-2 py-1 align-middle">
                <CardActionsMenu
                  ariaLabel={t.dates.cardActionsMenu}
                  actions={dateCardMenuActions(t.dates, () => onEdit(item), () => onDelete(item))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type MonthBlockProps = {
  monthItems: NSKDateItem[];
  monthLabel: string;
  /** Extra line under the month title (e.g. past-only block in the current month). */
  sectionSubtitle?: string;
  locale: Locale;
  onEdit: (item: NSKDateItem) => void;
  onDelete: (item: NSKDateItem) => void;
};

function MonthBlock({
  monthItems,
  monthLabel,
  sectionSubtitle,
  locale,
  onEdit,
  onDelete,
}: MonthBlockProps) {
  const { t } = useI18n();

  if (monthItems.length === 0) return null;

  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
        <span className="block">{monthLabel}</span>
        {sectionSubtitle ? (
          <span className="mt-0.5 block text-xs font-normal normal-case tracking-normal text-muted-foreground">
            {sectionSubtitle}
          </span>
        ) : null}
      </h3>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {monthItems.map((item) => {
          const { dayMonth, year } = formatDayMonthYear(locale, item);
          return (
            <li key={item.id}>
              <Card className="h-full border border-border/70">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <CardTitle className="leading-tight">{item.label}</CardTitle>
                      <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
                        <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
                          {dayMonth}
                        </span>
                        <span className="text-xs text-muted-foreground">{year}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("font-medium", semanticBadgeOutlineClass(item.type_id))}
                      >
                        {t.dates.types[item.type_id]}
                      </Badge>
                      <CardActionsMenu
                        ariaLabel={t.dates.cardActionsMenu}
                        actions={dateCardMenuActions(t.dates, () => onEdit(item), () =>
                          onDelete(item)
                        )}
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export type DatesViewProps = {
  items: NSKDateItem[];
  viewMode: DatesViewMode;
  locale: Locale;
  calendarMonth: Date;
  onCalendarMonthChange: (month: Date) => void;
  onEdit: (item: NSKDateItem) => void;
  onDelete: (item: NSKDateItem) => void;
};

export function DatesView({
  items,
  viewMode,
  locale,
  calendarMonth,
  onCalendarMonthChange,
  onEdit,
  onDelete,
}: DatesViewProps) {
  const { t } = useI18n();
  const [pastOpen, setPastOpen] = useState(false);

  function renderTable() {
    return <DatesListTable items={items} locale={locale} onEdit={onEdit} onDelete={onDelete} />;
  }

  function renderGrid() {
    const now = new Date();
    const grouped = groupByCalendarMonth(items);
    const monthIndices = MONTH_INDEX_ORDER.filter((m) => (grouped.get(m)?.length ?? 0) > 0);

    const currentMonth = now.getMonth();

    const itemsStillUpcoming = (list: NSKDateItem[]) =>
      list.filter((item) => !isOccurrenceStrictlyPast(item, now));
    const itemsAlreadyPastThisYear = (list: NSKDateItem[]) =>
      list.filter((item) => isOccurrenceStrictlyPast(item, now));

    const upcomingMonthIndices = monthIndices.filter((m) => {
      if (m < currentMonth) return false;
      return itemsStillUpcoming(grouped.get(m)!).length > 0;
    });

    const pastMonthIndices = monthIndices.filter((m) => m < currentMonth);
    const pastMonthIndicesWithContent = pastMonthIndices.filter(
      (m) => itemsAlreadyPastThisYear(grouped.get(m)!).length > 0
    );
    const pastInCurrentMonth = itemsAlreadyPastThisYear(grouped.get(currentMonth) ?? []);

    const showPastToggle =
      pastMonthIndicesWithContent.length > 0 || pastInCurrentMonth.length > 0;

    const futureOneOffLater = futureOneOffsAfterMainStrip(items, now, currentMonth);

    return (
      <div className="space-y-8">
        {upcomingMonthIndices.map((monthIndex) => (
          <MonthBlock
            key={monthIndex}
            monthItems={itemsStillUpcoming(grouped.get(monthIndex)!)}
            monthLabel={monthName(locale, monthIndex)}
            locale={locale}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {futureOneOffLater.length > 0 ? (
          <MonthBlock
            key="future-one-off"
            monthItems={futureOneOffLater}
            monthLabel={t.dates.futureOneOffSectionTitle}
            locale={locale}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : null}

        {showPastToggle ? (
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
            {pastOpen ? (
              <div className="mt-4 space-y-8">
                {pastMonthIndicesWithContent.map((monthIndex) => (
                  <MonthBlock
                    key={monthIndex}
                    monthItems={itemsAlreadyPastThisYear(grouped.get(monthIndex)!)}
                    monthLabel={monthName(locale, monthIndex)}
                    locale={locale}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
                {pastInCurrentMonth.length > 0 ? (
                  <MonthBlock
                    key={`past-in-${currentMonth}`}
                    monthItems={pastInCurrentMonth}
                    monthLabel={monthName(locale, currentMonth)}
                    sectionSubtitle={t.dates.pastSectionMonthSubtitle}
                    locale={locale}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  function renderCalendar() {
    return (
      <MonthGridCalendar<NSKDateItem>
        locale={locale}
        month={calendarMonth}
        onMonthChange={onCalendarMonthChange}
        regionAriaLabel={t.dates.calendarMonthNav}
        prevMonthAriaLabel={t.dates.calendarPrevMonth}
        nextMonthAriaLabel={t.dates.calendarNextMonth}
        getItemsForDay={(day) => getDateItemsForCalendarDay(items, day)}
        getItemKey={(item) => item.id}
        renderItem={(item) => (
          <Badge
            variant="outline"
            render={<button type="button" />}
            title={item.label}
            onClick={() => onEdit(item)}
            className={cn(
              "h-auto min-h-5 w-full max-w-full justify-start truncate py-0.5 text-left text-[11px] font-medium leading-tight sm:text-xs",
              semanticBadgeOutlineClass(item.type_id)
            )}
          >
            {item.label}
          </Badge>
        )}
      />
    );
  }

  function renderItemsForView() {
    switch (viewMode) {
      case "list":
        return renderTable();
      case "grid":
        return renderGrid();
      case "calendar":
        return renderCalendar();
    }
  }

  return renderItemsForView();
}

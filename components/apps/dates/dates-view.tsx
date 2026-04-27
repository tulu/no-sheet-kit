"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Repeat2, Trash2 } from "lucide-react";
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
import {
  semanticBadgeOutlineClass,
  semanticToTone,
  type BadgeTone,
} from "@/components/common/semantic-badge";
import {
  getItemsForDay as getDateItemsForCalendarDay,
  getLastPassedRecurringOccurrence,
  getNextOccurrenceDate,
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

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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

function yearMonthKey(year: number, month: number): string {
  return `${year}-${month}`;
}

function parseYearMonthKey(key: string): { year: number; month: number } {
  const [ys, ms] = key.split("-");
  return { year: Number(ys), month: Number(ms) };
}

function monthYearLabel(locale: Locale, year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat(getIntlLocaleTag(locale), {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

/**
 * Year–month bucket for grid: non-recurring = stored date; recurring future anchor = anchor;
 * recurring past anchor + upcoming = next occurrence; recurring past anchor + past section =
 * last occurrence before today (e.g. March 2026 when today is April 2026).
 */
function getGridYearMonthForItem(
  item: NSKDateItem,
  now: Date,
  mode: "upcoming" | "past"
): { year: number; month: number } {
  const src = parseItemLocalDate(item);
  if (!src) {
    const t = startOfLocalDay(now);
    return { year: t.getFullYear(), month: t.getMonth() };
  }

  if (!item.is_recurring) {
    return { year: src.getFullYear(), month: src.getMonth() };
  }

  const today = startOfLocalDay(now);
  const anchor = startOfLocalDay(src);

  if (anchor.getTime() >= today.getTime()) {
    return { year: anchor.getFullYear(), month: anchor.getMonth() };
  }

  if (mode === "past") {
    const last = getLastPassedRecurringOccurrence(item, now);
    if (last) {
      return { year: last.getFullYear(), month: last.getMonth() };
    }
    return { year: src.getFullYear(), month: src.getMonth() };
  }

  const next = getNextOccurrenceDate(item, now);
  if (!next) return { year: src.getFullYear(), month: src.getMonth() };
  return { year: next.getFullYear(), month: next.getMonth() };
}

function buildYearMonthBucketMap(
  items: NSKDateItem[],
  now: Date,
  mode: "upcoming" | "past"
): Map<string, NSKDateItem[]> {
  const map = new Map<string, NSKDateItem[]>();
  for (const item of items) {
    const past = isOccurrenceStrictlyPast(item, now);
    if (mode === "upcoming" && past) continue;
    if (mode === "past" && !past) continue;

    const { year, month } = getGridYearMonthForItem(item, now, mode);
    const key = yearMonthKey(year, month);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  for (const list of map.values()) {
    list.sort(compareByDayOfMonthThenIsoDate);
  }
  return map;
}

function sortedYearMonthKeys(keys: string[], order: "asc" | "desc"): string[] {
  const parsed = keys.map((k) => ({ k, ...parseYearMonthKey(k) }));
  parsed.sort((a, b) => {
    if (a.year !== b.year) return order === "asc" ? a.year - b.year : b.year - a.year;
    return order === "asc" ? a.month - b.month : b.month - a.month;
  });
  return parsed.map((p) => p.k);
}

/** Card body date: always the stored calendar day (e.g. birth year for recurring birthdays). */
function formatDayMonthYearForCard(locale: Locale, item: NSKDateItem): {
  dayMonth: string;
  year: string;
} {
  const src = parseItemLocalDate(item);
  if (!src) return { dayMonth: "", year: "" };

  const intl = getIntlLocaleTag(locale);
  const dayMonth = new Intl.DateTimeFormat(intl, {
    day: "numeric",
    month: "long",
  }).format(src);
  const year = new Intl.DateTimeFormat(intl, { year: "numeric" }).format(src);
  return { dayMonth, year };
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
          const { dayMonth, year } = formatDayMonthYearForCard(locale, item);
          return (
            <li key={item.id}>
              <Card className="h-full overflow-hidden border border-border/70 gap-0 py-0 pb-4">
                <div
                  className={cn("h-1 w-full shrink-0", TONE_TOP_ACCENT[semanticToTone(item.type_id)])}
                  aria-hidden
                />
                <CardHeader className="gap-3 rounded-none px-4 pb-0 pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <CardTitle className="leading-tight">{item.label}</CardTitle>
                      <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
                        <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
                          {dayMonth}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">{year}</span>
                          {item.is_recurring ? (
                            <Repeat2
                              className="size-3.5 shrink-0 text-muted-foreground"
                              aria-label={t.dates.fields.recurring}
                            />
                          ) : null}
                        </span>
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
    const upcomingMap = buildYearMonthBucketMap(items, now, "upcoming");
    const pastMap = buildYearMonthBucketMap(items, now, "past");

    const upcomingKeys = sortedYearMonthKeys([...upcomingMap.keys()], "asc");
    const pastKeys = sortedYearMonthKeys([...pastMap.keys()], "desc");
    const showPastToggle = pastKeys.length > 0;

    const nowY = now.getFullYear();
    const nowM = now.getMonth();

    return (
      <div className="space-y-8">
        {upcomingKeys.map((key) => {
          const { year, month } = parseYearMonthKey(key);
          return (
            <MonthBlock
              key={`up-${key}`}
              monthItems={upcomingMap.get(key)!}
              monthLabel={monthYearLabel(locale, year, month)}
              locale={locale}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}

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
                {pastKeys.map((key) => {
                  const { year, month } = parseYearMonthKey(key);
                  const sectionSubtitle =
                    year === nowY && month === nowM ? t.dates.pastSectionMonthSubtitle : undefined;
                  return (
                    <MonthBlock
                      key={`past-${key}`}
                      monthItems={pastMap.get(key)!}
                      monthLabel={monthYearLabel(locale, year, month)}
                      sectionSubtitle={sectionSubtitle}
                      locale={locale}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  );
                })}
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

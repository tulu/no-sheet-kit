"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CardActionsMenu,
  type CardActionsMenuItem,
} from "@/components/common/card-actions-menu";
import { MonthGridCalendar } from "@/components/common/month-grid-calendar";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/types";
import type { NSKTrackerEntry, TrackerViewMode } from "@/lib/tracker/schema";
import {
  buildEntriesYearMonthBucketMap,
  entriesOnCalendarDay,
  formatEntryTimeRange,
  formatTrackerDateLong,
  formatTrackerDateShort,
  monthYearLabel,
  parseYearMonthKey,
  sortedYearMonthKeys,
} from "@/lib/tracker/tracker-helpers";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TrackerViewProps = {
  entries: NSKTrackerEntry[];
  viewMode: TrackerViewMode;
  locale: Locale;
  calendarMonth: Date;
  onCalendarMonthChange: (month: Date) => void;
  onEdit: (entry: NSKTrackerEntry) => void;
  onDelete: (entry: NSKTrackerEntry) => void;
};

function entryMenuActions(
  entry: NSKTrackerEntry,
  labels: { edit: string; delete: string },
  onEdit: () => void,
  onDelete: () => void
): CardActionsMenuItem[] {
  return [
    { label: labels.edit, icon: Pencil, onSelect: onEdit },
    { label: labels.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
}

type TrackerEntryCardProps = {
  entry: NSKTrackerEntry;
  locale: Locale;
  menuLabels: { edit: string; delete: string };
  onEdit: (entry: NSKTrackerEntry) => void;
  onDelete: (entry: NSKTrackerEntry) => void;
};

function TrackerEntryCard({ entry, locale, menuLabels, onEdit, onDelete }: TrackerEntryCardProps) {
  const { t } = useI18n();
  const timeRange = formatEntryTimeRange(entry);

  return (
    <Card className="h-full overflow-hidden border border-border/70 gap-0 py-0 pb-4 shadow-sm">
      <div className="h-1 w-full shrink-0 bg-blue-500" aria-hidden />
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 rounded-none px-4 pb-0 pt-3">
        <CardTitle className="text-base font-semibold leading-snug">
          {formatTrackerDateLong(entry.occurred_on, locale)}
        </CardTitle>
        <CardActionsMenu
          ariaLabel={t.tracker.cardActionsMenu}
          actions={entryMenuActions(entry, menuLabels, () => onEdit(entry), () => onDelete(entry))}
        />
      </CardHeader>
      <CardContent className="space-y-1 px-4 pb-0 pt-1.5 text-sm">
        {timeRange ? (
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{t.tracker.fields.timeRange}:</span>{" "}
            {timeRange}
          </p>
        ) : null}
        {entry.notes ? (
          <p className="line-clamp-3 whitespace-pre-wrap text-muted-foreground">{entry.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

type TrackerMonthBlockProps = {
  monthEntries: NSKTrackerEntry[];
  monthLabel: string;
  locale: Locale;
  menuLabels: { edit: string; delete: string };
  onEdit: (entry: NSKTrackerEntry) => void;
  onDelete: (entry: NSKTrackerEntry) => void;
};

function TrackerMonthBlock({
  monthEntries,
  monthLabel,
  locale,
  menuLabels,
  onEdit,
  onDelete,
}: TrackerMonthBlockProps) {
  if (monthEntries.length === 0) return null;

  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
        {monthLabel} ({monthEntries.length})
      </h3>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {monthEntries.map((entry) => (
          <li key={entry.id}>
            <TrackerEntryCard
              entry={entry}
              locale={locale}
              menuLabels={menuLabels}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TrackerView({
  entries,
  viewMode,
  locale,
  calendarMonth,
  onCalendarMonthChange,
  onEdit,
  onDelete,
}: TrackerViewProps) {
  const { t } = useI18n();
  const [pastOpen, setPastOpen] = useState(false);
  const menuLabels = { edit: t.tracker.editEntry, delete: t.tracker.deleteEntryAction };

  function renderGrid() {
    const now = new Date();
    const upcomingMap = buildEntriesYearMonthBucketMap(entries, "upcoming", now);
    const pastMap = buildEntriesYearMonthBucketMap(entries, "past", now);

    const upcomingKeys = sortedYearMonthKeys([...upcomingMap.keys()], "asc");
    const pastKeys = sortedYearMonthKeys([...pastMap.keys()], "desc");
    const showPastToggle = pastKeys.length > 0;

    return (
      <div className="space-y-8">
        {upcomingKeys.map((key) => {
          const { year, month } = parseYearMonthKey(key);
          return (
            <TrackerMonthBlock
              key={`up-${key}`}
              monthEntries={upcomingMap.get(key)!}
              monthLabel={monthYearLabel(locale, year, month)}
              locale={locale}
              menuLabels={menuLabels}
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
              {pastOpen ? t.tracker.hidePastMonths : t.tracker.showPastMonths}
            </button>
            {pastOpen ? (
              <div className="mt-4 space-y-8">
                {pastKeys.map((key) => {
                  const { year, month } = parseYearMonthKey(key);
                  return (
                    <TrackerMonthBlock
                      key={`past-${key}`}
                      monthEntries={pastMap.get(key)!}
                      monthLabel={monthYearLabel(locale, year, month)}
                      locale={locale}
                      menuLabels={menuLabels}
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

  function renderTable() {
    return (
      <div className="rounded-lg border border-border">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.tracker.table.date}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.tracker.table.start}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.tracker.table.end}
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.tracker.table.notes}
              </TableHead>
              <TableHead className="w-10 px-2 py-2">
                <span className="sr-only">{t.tracker.cardActionsMenu}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-muted/20">
                <TableCell className="px-3 py-2 font-medium text-foreground">
                  {formatTrackerDateShort(entry.occurred_on, locale)}
                </TableCell>
                <TableCell className="px-3 py-2 text-muted-foreground">
                  {entry.start_time ?? "—"}
                </TableCell>
                <TableCell className="px-3 py-2 text-muted-foreground">
                  {entry.end_time ?? "—"}
                </TableCell>
                <TableCell className="max-w-[280px] truncate px-3 py-2 text-muted-foreground">
                  {entry.notes?.trim() || "—"}
                </TableCell>
                <TableCell className="px-2 py-1 align-middle">
                  <CardActionsMenu
                    ariaLabel={t.tracker.cardActionsMenu}
                    actions={entryMenuActions(entry, menuLabels, () => onEdit(entry), () =>
                      onDelete(entry)
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
      <MonthGridCalendar<NSKTrackerEntry>
        locale={locale}
        month={calendarMonth}
        onMonthChange={onCalendarMonthChange}
        regionAriaLabel={t.tracker.calendarMonthNav}
        prevMonthAriaLabel={t.tracker.calendarPrevMonth}
        nextMonthAriaLabel={t.tracker.calendarNextMonth}
        getItemsForDay={(day) => entriesOnCalendarDay(entries, day)}
        getItemKey={(entry) => entry.id}
        renderItem={(entry) => {
          const timeRange = formatEntryTimeRange(entry);
          const notes = entry.notes?.trim() ?? "";
          const headline = timeRange || t.tracker.calendarDayMark;
          return (
            <Badge
              variant="outline"
              render={<button type="button" />}
              title={notes ? `${headline} — ${notes}` : headline}
              onClick={() => onEdit(entry)}
              className={cn(
                "h-auto min-h-5 w-full max-w-full flex-col items-stretch gap-0 whitespace-normal rounded-md px-1.5 py-0.5 text-left text-[11px] leading-tight sm:text-xs",
                "border border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300"
              )}
            >
              <span className="w-full truncate font-medium">{headline}</span>
              {notes ? (
                <span className="w-full truncate text-[10px] font-normal opacity-80 sm:text-[11px]">
                  {notes}
                </span>
              ) : null}
            </Badge>
          );
        }}
      />
    );
  }

  switch (viewMode) {
    case "grid":
      return renderGrid();
    case "list":
      return renderTable();
    case "calendar":
      return renderCalendar();
  }
}

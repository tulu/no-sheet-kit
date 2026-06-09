"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CardActionsMenu,
  type CardActionsMenuItem,
} from "@/components/common/card-actions-menu";
import { MonthGridCalendar } from "@/components/common/month-grid-calendar";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n/types";
import type { NSKTrackerEntry, TrackerViewMode } from "@/lib/tracker/schema";
import {
  entriesOnCalendarDay,
  formatEntryTimeRange,
  formatTrackerDateLong,
  formatTrackerDateShort,
} from "@/lib/tracker/tracker-helpers";
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
  const menuLabels = { edit: t.tracker.editEntry, delete: t.tracker.deleteEntryAction };

  function renderGrid() {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => {
          const timeRange = formatEntryTimeRange(entry);
          return (
            <li key={entry.id}>
              <Card className="h-full border border-border/70 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold leading-snug">
                    {formatTrackerDateLong(entry.occurred_on, locale)}
                  </CardTitle>
                  <CardActionsMenu
                    ariaLabel={t.tracker.cardActionsMenu}
                    actions={entryMenuActions(entry, menuLabels, () => onEdit(entry), () =>
                      onDelete(entry)
                    )}
                  />
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
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
            </li>
          );
        })}
      </ul>
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
          const label = timeRange
            ? `${formatTrackerDateShort(entry.occurred_on, locale)} ${timeRange}`
            : formatTrackerDateShort(entry.occurred_on, locale);
          return (
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="flex w-full max-w-full min-w-0 items-center rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-left text-[11px] leading-tight transition-colors hover:bg-muted/60 sm:text-xs"
              title={entry.notes ?? label}
            >
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {timeRange || t.tracker.calendarDayMark}
              </span>
            </button>
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

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CardActionsMenu, type CardActionsMenuItem } from "@/components/common/card-actions-menu";
import { Archive, ArchiveRestore, CalendarCheck2, Pencil, Trash2 } from "lucide-react";
import type { NSKTask, TaskStatus } from "@/lib/tasks/schema";
import { isTaskPastDue } from "@/lib/tasks/tasks-helpers";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

export type TasksListViewProps = {
  tasks: NSKTask[];
  highlightTaskId?: string | null;
  localeTag: string;
  statusLabel: Record<TaskStatus, string>;
  labels: {
    edit: string;
    delete: string;
    archive: string;
    unarchive: string;
    cardActionsMenu: string;
    tableTitle: string;
    tableStatus: string;
    tableDue: string;
    tableComments: string;
    tableArchived: string;
  };
  onEdit: (task: NSKTask) => void;
  onDelete: (task: NSKTask) => void;
  onArchive: (task: NSKTask) => void;
  onUnarchive: (task: NSKTask) => void;
};

function formatDue(iso: string | undefined, locale: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export function TasksListView({
  tasks,
  highlightTaskId = null,
  localeTag,
  statusLabel,
  labels,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}: TasksListViewProps) {
  const { t } = useI18n();
  const sorted = [...tasks].sort((a, b) => {
    const st = a.status.localeCompare(b.status);
    if (st !== 0) return st;
    return a.order - b.order || a.title.localeCompare(b.title);
  });

  function actionsFor(task: NSKTask): CardActionsMenuItem[] {
    const out: CardActionsMenuItem[] = [
      { label: labels.edit, icon: Pencil, onSelect: () => onEdit(task) },
    ];
    if (task.archived) {
      out.push({ label: labels.unarchive, icon: ArchiveRestore, onSelect: () => onUnarchive(task) });
    } else if (task.status === "done") {
      out.push({ label: labels.archive, icon: Archive, onSelect: () => onArchive(task) });
    }
    out.push({ label: labels.delete, icon: Trash2, onSelect: () => onDelete(task), destructive: true });
    return out;
  }

  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.tableTitle}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.tableStatus}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.tableDue}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.tableComments}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.tableArchived}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{labels.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((task) => (
            <TableRow
              key={task.id}
              data-task-id={task.id}
              className={cn(
                "hover:bg-muted/20",
                task.archived && "opacity-70",
                highlightTaskId === task.id &&
                  "bg-teal-500/10 ring-1 ring-inset ring-teal-500/50 animate-pulse dark:bg-teal-400/10 dark:ring-teal-400/45"
              )}
            >
              <TableCell className="max-w-[240px] px-3 py-2 font-medium text-foreground">
                <div className="truncate">{task.title}</div>
              </TableCell>
              <TableCell className="px-3 py-2">
                <Badge variant="outline">{statusLabel[task.status]}</Badge>
              </TableCell>
              <TableCell
                className={cn(
                  "px-3 py-2 text-muted-foreground",
                  task.due_date && isTaskPastDue(task) && "font-medium text-destructive"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {formatDue(task.due_date, localeTag)}
                  {task.google_calendar_event_id ? (
                    <CalendarCheck2
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-label={t.googleCalendar.linkedBadge}
                    />
                  ) : null}
                </span>
              </TableCell>
              <TableCell className="px-3 py-2 tabular-nums text-muted-foreground">{task.comments.length}</TableCell>
              <TableCell className="px-3 py-2 text-muted-foreground">{task.archived ? "✓" : "—"}</TableCell>
              <TableCell className="px-2 py-1 align-middle">
                <CardActionsMenu ariaLabel={labels.cardActionsMenu} actions={actionsFor(task)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

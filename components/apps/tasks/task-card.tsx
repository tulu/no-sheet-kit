"use client";

import { Archive, ArchiveRestore, Calendar, CalendarCheck2, MessageSquareText, Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardActionsMenu, type CardActionsMenuItem } from "@/components/common/card-actions-menu";
import { cn } from "@/lib/utils";
import type { NSKTask } from "@/lib/tasks/schema";
import { isTaskPastDue } from "@/lib/tasks/tasks-helpers";

export type TaskCardProps = {
  task: NSKTask;
  labels: {
    edit: string;
    delete: string;
    archive: string;
    unarchive: string;
    cardActionsMenu: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  /** When true, card is a sortable drag handle wrapper (listeners on root). */
  dragListeners?: Record<string, unknown>;
  dragAttributes?: Record<string, unknown>;
  isDragging?: boolean;
  style?: React.CSSProperties;
  /** Kanban: neutralize Card outer py/gap and use balanced insets. */
  compact?: boolean;
  /** Pulse ring after navigating from dashboard `?highlight=`. */
  highlightFlash?: boolean;
};

export function TaskCard({
  task,
  labels,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  dragListeners,
  dragAttributes,
  isDragging,
  style,
  compact,
  highlightFlash,
}: TaskCardProps) {
  const { t } = useI18n();
  const dueIsPast = task.due_date ? isTaskPastDue(task) : false;
  const actions: CardActionsMenuItem[] = [
    { label: labels.edit, icon: Pencil, onSelect: onEdit },
    { label: labels.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
  if (task.archived && onUnarchive) {
    actions.splice(1, 0, { label: labels.unarchive, icon: ArchiveRestore, onSelect: onUnarchive });
  } else if (!task.archived && task.status === "done" && onArchive) {
    actions.splice(1, 0, { label: labels.archive, icon: Archive, onSelect: onArchive });
  }

  return (
    <Card
      style={style}
      className={cn(
        "border border-border/70 shadow-sm transition-shadow",
        /** Base Card uses py-4 + gap-4; compact Kanban needs tighter vertical rhythm and room on the sides. */
        compact && "gap-1 py-0",
        highlightFlash && "ring-2 ring-teal-500/80 ring-offset-2 ring-offset-background animate-pulse dark:ring-teal-400/70",
        isDragging && "opacity-60 ring-2 ring-ring",
        task.archived && "opacity-75"
      )}
      {...dragAttributes}
      {...dragListeners}
    >
      <CardHeader
        className={cn(
          "space-y-0",
          compact ? "gap-1.5 px-3 py-2" : "gap-2 p-3 pb-2"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">{task.title}</p>
          <div className="flex shrink-0 items-center gap-2">
            {task.google_calendar_event_id ? (
              <span
                className="inline-flex items-center rounded-full bg-emerald-500/12 p-1 text-emerald-600 dark:text-emerald-400"
                title={t.googleCalendar.linkedBadge}
                aria-label={t.googleCalendar.linkedBadge}
              >
                <CalendarCheck2 className="size-3.5" aria-hidden />
              </span>
            ) : null}
            <CardActionsMenu ariaLabel={labels.cardActionsMenu} actions={actions} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {task.due_date ? (
            <Badge
              variant="outline"
              className={cn(
                "gap-1 font-normal",
                dueIsPast && "border-destructive/60 text-destructive [&_svg]:text-destructive"
              )}
            >
              <Calendar className="size-3" aria-hidden />
              {task.due_date}
              {task.google_calendar_event_id ? (
                <CalendarCheck2 className="size-3 text-muted-foreground" aria-label={t.googleCalendar.linkedBadge} />
              ) : null}
            </Badge>
          ) : null}
          {task.comments.length > 0 ? (
            <Badge variant="secondary" className="gap-1 font-normal">
              <MessageSquareText className="size-3" aria-hidden />
              {task.comments.length}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      {task.description ? (
        <CardContent className={cn(compact ? "px-3 pb-2 pt-0" : "px-3 pb-3 pt-0")}>
          <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

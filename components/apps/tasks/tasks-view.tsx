"use client";

import type { ComponentProps } from "react";
import type { TasksViewMode } from "@/lib/tasks/schema";
import type { NSKTask } from "@/lib/tasks/schema";
import type { Locale } from "@/lib/i18n/types";
import { TasksKanbanBoard, type TaskCardPropsLabels } from "./tasks-kanban-board";
import { TasksListView } from "./tasks-list-view";
import { TasksCalendarView } from "./tasks-calendar-view";

export type TasksViewProps = {
  viewMode: TasksViewMode;
  spaceId: string;
  /** Tasks in this space (already filtered by archived + search). */
  tasks: NSKTask[];
  allTasks: NSKTask[];
  /** From `?highlight=` — pulse + scroll when task is visible. */
  highlightTaskId?: string | null;
  onTasksReplace: (next: NSKTask[]) => void;
  columnTitles: {
    todo: string;
    inProgress: string;
    done: string;
  };
  cardLabels: TaskCardPropsLabels;
  listLabels: ComponentProps<typeof TasksListView>["labels"];
  statusLabel: Record<NSKTask["status"], string>;
  localeTag: string;
  locale: Locale;
  calendarMonth: Date;
  onCalendarMonthChange: (month: Date) => void;
  onSwitchToListView?: () => void;
  onEdit: (task: NSKTask) => void;
  onDelete: (task: NSKTask) => void;
  onArchive: (task: NSKTask) => void;
  onUnarchive: (task: NSKTask) => void;
  onArchiveAllDone?: () => void;
  doneColumnMenuLabels?: {
    menuAriaLabel: string;
    archiveAllLabel: string;
  };
};

export function TasksView({
  viewMode,
  spaceId,
  tasks,
  allTasks,
  highlightTaskId = null,
  onTasksReplace,
  columnTitles,
  cardLabels,
  listLabels,
  statusLabel,
  localeTag,
  locale,
  calendarMonth,
  onCalendarMonthChange,
  onSwitchToListView,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onArchiveAllDone,
  doneColumnMenuLabels,
}: TasksViewProps) {
  if (viewMode === "calendar") {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TasksCalendarView
          locale={locale}
          tasks={tasks}
          calendarMonth={calendarMonth}
          onCalendarMonthChange={onCalendarMonthChange}
          statusLabel={statusLabel}
          onEdit={onEdit}
          onShowListView={onSwitchToListView}
        />
      </div>
    );
  }
  if (viewMode === "kanban") {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <TasksKanbanBoard
          tasks={tasks}
          highlightTaskId={highlightTaskId}
          columnTitles={columnTitles}
          labels={cardLabels}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          doneColumnMenu={
            onArchiveAllDone && doneColumnMenuLabels
              ? {
                  menuAriaLabel: doneColumnMenuLabels.menuAriaLabel,
                  archiveAllLabel: doneColumnMenuLabels.archiveAllLabel,
                  onArchiveAll: onArchiveAllDone,
                }
              : undefined
          }
        />
      </div>
    );
  }
  return (
    <TasksListView
      tasks={tasks}
      highlightTaskId={highlightTaskId}
      localeTag={localeTag}
      statusLabel={statusLabel}
      labels={listLabels}
      onEdit={onEdit}
      onDelete={onDelete}
      onArchive={onArchive}
      onUnarchive={onUnarchive}
    />
  );
}

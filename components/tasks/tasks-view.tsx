"use client";

import type { ComponentProps } from "react";
import type { TasksViewMode } from "@/lib/tasks/schema";
import type { NSKTask } from "@/lib/tasks/schema";
import { TasksKanbanBoard, type TaskCardPropsLabels } from "./tasks-kanban-board";
import { TasksListView } from "./tasks-list-view";

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
  onEdit: (task: NSKTask) => void;
  onDelete: (task: NSKTask) => void;
  onArchive: (task: NSKTask) => void;
  onUnarchive: (task: NSKTask) => void;
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
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}: TasksViewProps) {
  if (viewMode === "kanban") {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <TasksKanbanBoard
          spaceId={spaceId}
          tasks={tasks}
          allTasks={allTasks}
          highlightTaskId={highlightTaskId}
          onTasksReplace={onTasksReplace}
          columnTitles={columnTitles}
          labels={cardLabels}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
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

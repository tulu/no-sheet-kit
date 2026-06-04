"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Archive, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TASK_STATUSES, type NSKTask, type TaskStatus } from "@/lib/tasks/schema";
import { tasksByStatus, TASKS_KANBAN_COL_PREFIX } from "@/lib/tasks/tasks-helpers";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";

export type TaskCardPropsLabels = {
  edit: string;
  delete: string;
  archive: string;
  unarchive: string;
  cardActionsMenu: string;
};

export type TasksKanbanBoardProps = {
  tasks: NSKTask[];
  highlightTaskId?: string | null;
  columnTitles: {
    todo: string;
    inProgress: string;
    done: string;
  };
  labels: TaskCardPropsLabels;
  onEdit: (task: NSKTask) => void;
  onDelete: (task: NSKTask) => void;
  onArchive: (task: NSKTask) => void;
  onUnarchive: (task: NSKTask) => void;
  doneColumnMenu?: {
    menuAriaLabel: string;
    archiveAllLabel: string;
    onArchiveAll: () => void;
  };
};

function DoneColumnHeaderMenu({
  menuAriaLabel,
  archiveAllLabel,
  onArchiveAll,
  disabled,
}: {
  menuAriaLabel: string;
  archiveAllLabel: string;
  onArchiveAll: () => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 shrink-0"
            aria-label={menuAriaLabel}
          />
        }
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex w-max min-w-44 max-w-[min(100vw-2rem,18rem)] flex-col gap-0.5 p-1.5"
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setOpen(false);
            onArchiveAll();
          }}
          className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="min-w-0 flex-1">{archiveAllLabel}</span>
          <Archive className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverContent>
    </Popover>
  );
}

function SortableTaskRow({
  task,
  labels,
  highlightFlash,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}: {
  task: NSKTask;
  labels: TaskCardPropsLabels;
  highlightFlash: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      data-task-id={task.id}
      style={style}
      className={cn("touch-none", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        labels={labels}
        onEdit={onEdit}
        onDelete={onDelete}
        onArchive={task.status === "done" && !task.archived ? onArchive : undefined}
        onUnarchive={task.archived ? onUnarchive : undefined}
        isDragging={isDragging}
        highlightFlash={highlightFlash}
        compact
      />
    </div>
  );
}

function KanbanColumn({
  status,
  title,
  tasks,
  labels,
  highlightTaskId,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  doneColumnMenu,
}: {
  status: TaskStatus;
  title: string;
  tasks: NSKTask[];
  labels: TaskCardPropsLabels;
  highlightTaskId: string | null | undefined;
  onEdit: (task: NSKTask) => void;
  onDelete: (task: NSKTask) => void;
  onArchive: (task: NSKTask) => void;
  onUnarchive: (task: NSKTask) => void;
  doneColumnMenu?: TasksKanbanBoardProps["doneColumnMenu"];
}) {
  const archivableCount = tasks.filter((t) => !t.archived).length;
  const dropId = `${TASKS_KANBAN_COL_PREFIX}${status}`;
  const { setNodeRef, isOver: isOverColumn } = useDroppable({ id: dropId });
  const { over, active } = useDndContext();
  const overId = over ? String(over.id) : null;
  const isDropTarget =
    Boolean(active) &&
    (isOverColumn || overId === dropId || tasks.some((t) => t.id === overId));
  const ids = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex min-h-0 flex-col gap-2 rounded-lg border border-border bg-muted/15 p-3",
        /* Desktop: altura fija al viewport — la cadena flex del layout no acota bien y lg:max-h-full no limitaba. */
        "lg:h-[calc(100dvh-21rem)] lg:max-h-[calc(100dvh-21rem)] lg:shrink-0"
      )}
    >
      {isDropTarget ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-lg shadow-[inset_0_0_0_2px_rgba(20,184,166,0.85)] ring-2 ring-inset ring-teal-500/80 dark:shadow-[inset_0_0_0_2px_rgba(45,212,191,0.8)]"
          aria-hidden
        />
      ) : null}
      <div className="flex shrink-0 items-start justify-between gap-2">
        <h3 className="min-w-0 text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}{" "}
          <span className="font-medium text-muted-foreground">({tasks.length})</span>
        </h3>
        {status === "done" && doneColumnMenu ? (
          <DoneColumnHeaderMenu
            menuAriaLabel={doneColumnMenu.menuAriaLabel}
            archiveAllLabel={doneColumnMenu.archiveAllLabel}
            onArchiveAll={doneColumnMenu.onArchiveAll}
            disabled={archivableCount === 0}
          />
        ) : null}
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-0.5 pb-14",
            "max-h-[min(24rem,calc(100dvh-14rem))] lg:max-h-none"
          )}
        >
          <div className="flex flex-col gap-1.5">
            {tasks.map((task) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                labels={labels}
                highlightFlash={highlightTaskId === task.id}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task)}
                onArchive={() => onArchive(task)}
                onUnarchive={() => onUnarchive(task)}
              />
            ))}
          </div>
        </div>
      </SortableContext>
    </div>
  );
}

export function TasksKanbanBoard({
  tasks,
  highlightTaskId = null,
  columnTitles,
  labels,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  doneColumnMenu,
}: TasksKanbanBoardProps) {
  const byStatus = (() => {
    const map: Record<TaskStatus, NSKTask[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const st of TASK_STATUSES) {
      map[st] = tasksByStatus(tasks, st);
    }
    return map;
  })();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
          <KanbanColumn
            status="todo"
            title={columnTitles.todo}
            tasks={byStatus.todo}
            labels={labels}
            highlightTaskId={highlightTaskId}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
          />
          <KanbanColumn
            status="in_progress"
            title={columnTitles.inProgress}
            tasks={byStatus.in_progress}
            labels={labels}
            highlightTaskId={highlightTaskId}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
          />
          <KanbanColumn
            status="done"
            title={columnTitles.done}
            tasks={byStatus.done}
            labels={labels}
            highlightTaskId={highlightTaskId}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            doneColumnMenu={doneColumnMenu}
          />
      </div>
    </div>
  );
}

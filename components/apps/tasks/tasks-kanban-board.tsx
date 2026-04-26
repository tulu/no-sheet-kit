"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TASK_STATUSES, type NSKTask, type TaskStatus } from "@/lib/tasks/schema";
import { applyKanbanDrag, tasksByStatus, TASKS_KANBAN_COL_PREFIX } from "@/lib/tasks/tasks-helpers";
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
  spaceId: string;
  tasks: NSKTask[];
  allTasks: NSKTask[];
  highlightTaskId?: string | null;
  onTasksReplace: (next: NSKTask[]) => void;
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
};

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
}) {
  const dropId = `${TASKS_KANBAN_COL_PREFIX}${status}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId });
  const ids = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 flex-col gap-2 overflow-hidden rounded-lg border border-border bg-muted/15 p-3",
        /* Desktop: altura fija al viewport — la cadena flex del layout no acota bien y lg:max-h-full no limitaba. */
        "lg:h-[calc(100dvh-21rem)] lg:max-h-[calc(100dvh-21rem)] lg:shrink-0",
        isOver && "ring-2 ring-ring/60"
      )}
    >
      <h3 className="shrink-0 text-base font-semibold tracking-tight text-foreground sm:text-lg">
        {title}{" "}
        <span className="font-medium text-muted-foreground">({tasks.length})</span>
      </h3>
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
  spaceId,
  tasks,
  allTasks,
  highlightTaskId = null,
  onTasksReplace,
  columnTitles,
  labels,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}: TasksKanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const activeTask = (() => {
    if (!activeId) return null;
    return allTasks.find((t) => t.id === activeId && t.space_id === spaceId) ?? null;
  })();

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const aid = String(active.id);
    const overId = String(over.id);
    if (aid === overId) return;
    const next = applyKanbanDrag({
      tasks: allTasks,
      spaceId,
      activeId: aid,
      overId,
    });
    if (next) onTasksReplace(next);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
          />
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="z-50 w-[min(100vw-2rem,20rem)] cursor-grabbing">
            <TaskCard
              task={activeTask}
              labels={labels}
              onEdit={() => {}}
              onDelete={() => {}}
              onArchive={undefined}
              onUnarchive={undefined}
              compact
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

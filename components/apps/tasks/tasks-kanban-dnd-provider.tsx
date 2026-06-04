"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState, type ReactNode } from "react";
import type { NSKTask } from "@/lib/tasks/schema";
import {
  applyKanbanDrag,
  moveTaskToSpace,
  parseTaskSpaceDropId,
} from "@/lib/tasks/tasks-helpers";
import { TaskCard, type TaskCardProps } from "./task-card";

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return closestCorners(args);
};

export type TasksKanbanDndProviderProps = {
  spaceId: string;
  allTasks: NSKTask[];
  onTasksReplace: (next: NSKTask[]) => void;
  onMovedToSpace: (targetSpaceId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  cardLabels: TaskCardProps["labels"];
  children: ReactNode;
};

export function TasksKanbanDndProvider({
  spaceId,
  allTasks,
  onTasksReplace,
  onMovedToSpace,
  onDragStart,
  onDragEnd,
  cardLabels,
  children,
}: TasksKanbanDndProviderProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeTask = activeId ? (allTasks.find((t) => t.id === activeId) ?? null) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    onDragStart?.();
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    onDragEnd?.();
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const overId = String(over.id);
    if (taskId === overId) return;

    const targetSpaceId = parseTaskSpaceDropId(overId);
    if (targetSpaceId) {
      const task = allTasks.find((t) => t.id === taskId);
      if (!task || task.space_id === targetSpaceId) return;
      onTasksReplace(moveTaskToSpace(allTasks, taskId, targetSpaceId));
      onMovedToSpace(targetSpaceId);
      return;
    }

    const next = applyKanbanDrag({
      tasks: allTasks,
      spaceId,
      activeId: taskId,
      overId,
    });
    if (next) onTasksReplace(next);
  }

  function handleDragCancel() {
    setActiveId(null);
    onDragEnd?.();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="z-50 w-[min(100vw-2rem,20rem)] cursor-grabbing">
            <TaskCard
              task={activeTask}
              labels={cardLabels}
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

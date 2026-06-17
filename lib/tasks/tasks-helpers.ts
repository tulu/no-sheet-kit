import { tokensMatchHaystack } from "@/lib/apps/filter-items-by-search";
import { TASK_STATUSES, type NSKSpace, type NSKTask, type NSKTasksSchema, type TaskStatus } from "./schema";

export function taskMatchesSearch(task: NSKTask, query: string): boolean {
  if (!query.trim()) return true;
  const commentBodies = task.comments.map((c) => c.body).join("\n");
  const hay = [task.title, task.description ?? "", commentBodies].join("\n");
  return tokensMatchHaystack(query, hay);
}

export function isUserVisibleSpace(space: NSKSpace): boolean {
  return space.visibility !== "embedded";
}

export function userVisibleSpaces(spaces: NSKSpace[]): NSKSpace[] {
  return spaces.filter(isUserVisibleSpace);
}

export function isTaskInUserSpace(schema: NSKTasksSchema, task: NSKTask): boolean {
  const space = schema.spaces.find((s) => s.id === task.space_id);
  return space != null && isUserVisibleSpace(space);
}

export function activeTasksInUserSpaces(schema: NSKTasksSchema): NSKTask[] {
  return schema.tasks.filter((t) => !t.archived && isTaskInUserSpace(schema, t));
}

export function userVisibleTasksSchema(schema: NSKTasksSchema): NSKTasksSchema {
  const spaces = userVisibleSpaces(schema.spaces);
  const spaceIds = new Set(spaces.map((s) => s.id));
  return {
    ...schema,
    spaces,
    tasks: schema.tasks.filter((t) => spaceIds.has(t.space_id)),
  };
}

export function sortSpaces(spaces: NSKSpace[]): NSKSpace[] {
  return [...spaces].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function tasksInSpace(
  tasks: NSKTask[],
  spaceId: string,
  options: { includeArchived: boolean }
): NSKTask[] {
  return tasks.filter(
    (t) => t.space_id === spaceId && (options.includeArchived || !t.archived)
  );
}

export function tasksByStatus(tasks: NSKTask[], status: TaskStatus): NSKTask[] {
  return [...tasks].filter((t) => t.status === status).sort((a, b) => a.order - b.order);
}

/** Max `order` in column + 1 (or 0 if empty). */
export function nextOrderForColumn(
  tasks: NSKTask[],
  spaceId: string,
  status: TaskStatus
): number {
  const col = tasks.filter((t) => t.space_id === spaceId && t.status === status);
  if (col.length === 0) return 0;
  return Math.max(...col.map((t) => t.order)) + 1;
}

export function activeTasksAllSpaces(schema: NSKTasksSchema): NSKTask[] {
  return schema.tasks.filter((t) => !t.archived);
}

export function countByStatus(tasks: NSKTask[]): Record<TaskStatus, number> {
  const out: Record<TaskStatus, number> = { todo: 0, in_progress: 0, done: 0 };
  for (const t of tasks) {
    out[t.status]++;
  }
  return out;
}

/** Done / (todo + in_progress + done), excluding archived from numerator and denominator. */
export function completionRatio(tasks: NSKTask[]): number | null {
  const active = tasks.filter((t) => !t.archived);
  const denom = active.length;
  if (denom === 0) return null;
  const done = active.filter((t) => t.status === "done").length;
  return done / denom;
}

export function tasksDueWithinDays(
  tasks: NSKTask[],
  from: Date,
  days: number
): NSKTask[] {
  const start = startOfLocalDay(from).getTime();
  const end = start + days * 86400000;
  return tasks.filter((t) => {
    if (t.archived || t.status === "done") return false;
    if (!t.due_date || !/^\d{4}-\d{2}-\d{2}$/.test(t.due_date)) return false;
    const d = new Date(`${t.due_date}T00:00:00`).getTime();
    return d >= start && d <= end;
  });
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Active task (not archived, not done) with due_date strictly before local today. */
export function isTaskPastDue(task: NSKTask, now: Date = new Date()): boolean {
  if (task.archived || task.status === "done") return false;
  if (!task.due_date || !/^\d{4}-\d{2}-\d{2}$/.test(task.due_date)) return false;
  const t0 = startOfLocalDay(now).getTime();
  const d = new Date(`${task.due_date}T00:00:00`).getTime();
  return d < t0;
}

export function overdueActiveTasks(tasks: NSKTask[], now: Date = new Date()): NSKTask[] {
  return tasks.filter((t) => isTaskPastDue(t, now));
}

/** Droppable id prefix for empty column hit area (concat status). */
export const TASKS_KANBAN_COL_PREFIX = "nsk-task-col:";

/** Droppable id prefix for sidebar space targets (concat space id). */
export const TASKS_SPACE_DROP_PREFIX = "nsk-task-space:";

export function taskSpaceDropId(spaceId: string): string {
  return `${TASKS_SPACE_DROP_PREFIX}${spaceId}`;
}

export function parseTaskSpaceDropId(overId: string): string | null {
  if (!overId.startsWith(TASKS_SPACE_DROP_PREFIX)) return null;
  const id = overId.slice(TASKS_SPACE_DROP_PREFIX.length);
  return id.length > 0 ? id : null;
}

function orderedIdsInColumn(tasks: NSKTask[], spaceId: string, status: TaskStatus): string[] {
  return tasks
    .filter((t) => t.space_id === spaceId && t.status === status)
    .sort((a, b) => a.order - b.order || a.created_at.localeCompare(b.created_at))
    .map((t) => t.id);
}

function arrayMoveIds(ids: string[], from: number, to: number): string[] {
  const r = [...ids];
  const [x] = r.splice(from, 1);
  r.splice(to, 0, x);
  return r;
}

/** Reassign `order` 0..n-1 per status column for tasks in this space. */
export function reindexTaskOrdersForSpace(tasks: NSKTask[], spaceId: string): NSKTask[] {
  const next = [...tasks];
  for (const st of TASK_STATUSES) {
    const ids = orderedIdsInColumn(next, spaceId, st);
    ids.forEach((id, i) => {
      const idx = next.findIndex((t) => t.id === id);
      if (idx >= 0) next[idx] = { ...next[idx], order: i, status: st };
    });
  }
  return next;
}

function patchOrdersForColumn(
  tasks: NSKTask[],
  spaceId: string,
  status: TaskStatus,
  orderedIds: string[],
  now: string,
  touchedId: string
): NSKTask[] {
  const next = [...tasks];
  orderedIds.forEach((id, order) => {
    const i = next.findIndex((t) => t.id === id);
    if (i >= 0) {
      next[i] = {
        ...next[i],
        status,
        order,
        updated_at: id === touchedId ? now : next[i].updated_at,
      };
    }
  });
  return next;
}

/**
 * Apply drag result: `overId` is another task id or `${TASKS_KANBAN_COL_PREFIX}${status}`.
 * Returns new tasks array or null if no-op / invalid.
 */
export function applyKanbanDrag(args: {
  tasks: NSKTask[];
  spaceId: string;
  activeId: string;
  overId: string;
}): NSKTask[] | null {
  const { tasks, spaceId, activeId, overId } = args;
  const now = new Date().toISOString();
  const active = tasks.find((t) => t.id === activeId && t.space_id === spaceId);
  if (!active) return null;

  let overStatus: TaskStatus;
  let overTaskId: string | null = null;

  if (overId.startsWith(TASKS_KANBAN_COL_PREFIX)) {
    const st = overId.slice(TASKS_KANBAN_COL_PREFIX.length);
    if (!(TASK_STATUSES as readonly string[]).includes(st)) return null;
    overStatus = st as TaskStatus;
  } else {
    const overTask = tasks.find((t) => t.id === overId && t.space_id === spaceId);
    if (!overTask) return null;
    if (overTask.id === activeId) return null;
    overStatus = overTask.status;
    overTaskId = overTask.id;
  }

  if (active.status === overStatus && overId.startsWith(TASKS_KANBAN_COL_PREFIX)) {
    return null;
  }

  if (active.status === overStatus) {
    const ids = orderedIdsInColumn(tasks, spaceId, overStatus);
    const oldIdx = ids.indexOf(activeId);
    if (oldIdx < 0) return null;
    let newIdx: number;
    if (overTaskId) {
      newIdx = ids.indexOf(overTaskId);
      if (newIdx < 0) return null;
      if (oldIdx < newIdx) newIdx -= 1;
    } else {
      newIdx = ids.length - 1;
    }
    if (oldIdx === newIdx) return null;
    const reordered = arrayMoveIds(ids, oldIdx, newIdx);
    return patchOrdersForColumn(tasks, spaceId, overStatus, reordered, now, activeId);
  }

  const fromIds = orderedIdsInColumn(tasks, spaceId, active.status).filter((id) => id !== activeId);
  const toIds = orderedIdsInColumn(tasks, spaceId, overStatus).filter((id) => id !== activeId);
  let insertAt = overTaskId ? toIds.indexOf(overTaskId) : toIds.length;
  if (insertAt < 0) insertAt = toIds.length;
  toIds.splice(insertAt, 0, activeId);

  let next = tasks.map((t) =>
    t.id === activeId ? { ...t, status: overStatus, updated_at: now } : t
  );
  next = patchOrdersForColumn(next, spaceId, active.status, fromIds, now, activeId);
  next = patchOrdersForColumn(next, spaceId, overStatus, toIds, now, activeId);
  return reindexTaskOrdersForSpace(next, spaceId);
}

/** Tasks with `due_date` on this local calendar day (YYYY-MM-DD). */
export function tasksOnCalendarDay(tasks: NSKTask[], day: Date): NSKTask[] {
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, "0");
  const d = String(day.getDate()).padStart(2, "0");
  const key = `${y}-${m}-${d}`;
  return tasks
    .filter((t) => t.due_date === key)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/** Move a task to another space; keeps status and appends to the end of that column. */
export function moveTaskToSpace(
  tasks: NSKTask[],
  taskId: string,
  targetSpaceId: string
): NSKTask[] {
  const task = tasks.find((t) => t.id === taskId);
  if (!task || task.space_id === targetSpaceId) return tasks;
  const sourceSpaceId = task.space_id;
  const now = new Date().toISOString();
  const order = nextOrderForColumn(tasks, targetSpaceId, task.status);
  let next = tasks.map((t) =>
    t.id === taskId ? { ...t, space_id: targetSpaceId, order, updated_at: now } : t
  );
  next = reindexTaskOrdersForSpace(next, sourceSpaceId);
  next = reindexTaskOrdersForSpace(next, targetSpaceId);
  return next;
}


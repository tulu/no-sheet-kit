"use client";

import {
  createEmptyNSKTasksSchema,
  isTaskStatus,
  NSKTASKS_SCHEMA_VERSION,
  NSKTASKS_STORAGE_KEY,
  type NSKSpace,
  type NSKTask,
  type NSKTaskComment,
  type NSKTasksSchema,
  type TaskStatus,
} from "./schema";

function normalizeComments(raw: unknown): NSKTaskComment[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  return raw.reduce<NSKTaskComment[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const c = row as Partial<NSKTaskComment>;
    if (typeof c.body !== "string" || c.body.trim().length === 0) return acc;
    const createdAt = typeof c.created_at === "string" ? c.created_at : now;
    const updatedAt = typeof c.updated_at === "string" ? c.updated_at : createdAt;
    acc.push({
      id: typeof c.id === "string" && c.id.trim() ? c.id : crypto.randomUUID(),
      body: c.body.trim(),
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
}

function normalizeTasks(raw: unknown, validSpaceIds: Set<string>): NSKTask[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  return raw.reduce<NSKTask[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const t = row as Partial<NSKTask>;
    if (typeof t.title !== "string" || t.title.trim().length === 0) return acc;
    if (typeof t.space_id !== "string" || !validSpaceIds.has(t.space_id)) return acc;
    const status: TaskStatus =
      typeof t.status === "string" && isTaskStatus(t.status) ? t.status : "todo";
    const createdAt = typeof t.created_at === "string" ? t.created_at : now;
    const updatedAt = typeof t.updated_at === "string" ? t.updated_at : createdAt;
    const order = typeof t.order === "number" && Number.isFinite(t.order) ? t.order : 0;
    acc.push({
      id: typeof t.id === "string" && t.id.trim() ? t.id : crypto.randomUUID(),
      space_id: t.space_id,
      title: t.title.trim(),
      description: typeof t.description === "string" ? t.description : undefined,
      due_date:
        typeof t.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.due_date)
          ? t.due_date
          : undefined,
      status,
      archived: Boolean(t.archived),
      order,
      created_at: createdAt,
      updated_at: updatedAt,
      comments: normalizeComments(t.comments),
    });
    return acc;
  }, []);
}

function normalizeSpaces(raw: unknown): NSKSpace[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  const list = raw.reduce<NSKSpace[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const s = row as Partial<NSKSpace>;
    if (typeof s.name !== "string" || s.name.trim().length === 0) return acc;
    const createdAt = typeof s.created_at === "string" ? s.created_at : now;
    const updatedAt = typeof s.updated_at === "string" ? s.updated_at : createdAt;
    acc.push({
      id: typeof s.id === "string" && s.id.trim() ? s.id : crypto.randomUUID(),
      name: s.name.trim(),
      order: typeof s.order === "number" && Number.isFinite(s.order) ? s.order : acc.length,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
  list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  return list;
}

export function readNSKTasksStorage(): NSKTasksSchema {
  if (typeof window === "undefined") return createEmptyNSKTasksSchema();

  const raw = window.localStorage.getItem(NSKTASKS_STORAGE_KEY);
  if (!raw) return createEmptyNSKTasksSchema();

  try {
    const parsed = JSON.parse(raw) as Partial<NSKTasksSchema> & {
      spaces?: unknown;
      tasks?: unknown;
    };
    const spaces = normalizeSpaces(parsed.spaces);
    if (spaces.length === 0) {
      return createEmptyNSKTasksSchema();
    }
    const validSpaceIds = new Set(spaces.map((s) => s.id));
    let tasks = normalizeTasks(parsed.tasks, validSpaceIds);
    /** Drop tasks whose space_id vanished */
    tasks = tasks.filter((t) => validSpaceIds.has(t.space_id));

    return {
      version: NSKTASKS_SCHEMA_VERSION,
      last_google_sync_at:
        typeof parsed.last_google_sync_at === "string" ? parsed.last_google_sync_at : null,
      spaces,
      tasks,
    };
  } catch {
    return createEmptyNSKTasksSchema();
  }
}

export function writeNSKTasksStorage(next: NSKTasksSchema) {
  if (typeof window === "undefined") return;
  const validSpaceIds = new Set(next.spaces.map((s) => s.id));
  const spaces = normalizeSpaces(next.spaces);
  const tasks = normalizeTasks(next.tasks, validSpaceIds);
  const payload: NSKTasksSchema = {
    version: NSKTASKS_SCHEMA_VERSION,
    last_google_sync_at: next.last_google_sync_at ?? null,
    spaces,
    tasks,
  };
  window.localStorage.setItem(NSKTASKS_STORAGE_KEY, JSON.stringify(payload));
}

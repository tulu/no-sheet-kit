export { NSKTASKS_STORAGE_KEY } from "@/lib/storage/anonymous-storage-keys";
export const NSKTASKS_SCHEMA_VERSION = 1;

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASKS_VIEW_MODES = ["kanban", "list"] as const;
export type TasksViewMode = (typeof TASKS_VIEW_MODES)[number];

/** Sidebar: overview entry (not a real space id). */
export const TASKS_DASHBOARD_NAV_ID = "__dashboard__" as const;
export type TasksNavSelection = typeof TASKS_DASHBOARD_NAV_ID | string;

export type NSKTaskComment = {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type NSKTask = {
  id: string;
  space_id: string;
  title: string;
  description?: string;
  /** YYYY-MM-DD */
  due_date?: string;
  status: TaskStatus;
  archived: boolean;
  /** Sort key within `(space_id, status)` for Kanban/list. */
  order: number;
  created_at: string;
  updated_at: string;
  comments: NSKTaskComment[];
};

export type NSKSpace = {
  id: string;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type NSKTasksSchema = {
  version: number;
  /** ISO timestamp of last successful Google Drive sync for this app payload, if any. */
  last_google_sync_at: string | null;
  spaces: NSKSpace[];
  tasks: NSKTask[];
};

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

export function createEmptyNSKTasksSchema(): NSKTasksSchema {
  return {
    version: NSKTASKS_SCHEMA_VERSION,
    last_google_sync_at: null,
    spaces: [],
    tasks: [],
  };
}

export function createBootstrapNSKTasksSchema(): NSKTasksSchema {
  const now = new Date().toISOString();
  const spaceId = crypto.randomUUID();
  return {
    version: NSKTASKS_SCHEMA_VERSION,
    last_google_sync_at: null,
    spaces: [
      {
        id: spaceId,
        name: "Personal",
        order: 0,
        created_at: now,
        updated_at: now,
      },
    ],
    tasks: [],
  };
}

import type { GoogleCalendarSubmitPrefs } from "@/components/common/google-calendar-event-options";
import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/types";
import { buildAllDayNskEventInput } from "@/lib/google/calendar-event-body";
import {
  buildEventTaskCalendarCopy,
  buildTaskCalendarCopy,
} from "@/lib/google/calendar-event-copy";
import {
  nskCalendarCreateEvent,
  nskCalendarDeleteEvent,
  nskCalendarGetNoSheetKitCalendarId,
  nskCalendarPatchEvent,
} from "@/lib/google/calendar-sync-client";
import type { NskCalendarEventInput } from "@/lib/google/google-calendar";
import type { NSKSpace, NSKTask } from "./schema";
import { moveTaskToSpace, nextOrderForColumn } from "./tasks-helpers";

export type TaskFormValues = {
  title: string;
  description: string;
  due_date: string;
  space_id: string;
};

export type TaskCalendarContext =
  | { kind: "space"; spaceName: string | undefined }
  | { kind: "event"; eventName: string | undefined };

export type SaveTaskResult =
  | { ok: true; tasks: NSKTask[]; navigateToSpaceId?: string }
  | { ok: false; cancelled?: boolean };

function calendarCopy(
  task: Pick<NSKTask, "title" | "description" | "due_date">,
  context: TaskCalendarContext,
  t: Messages,
  locale: Locale
) {
  if (context.kind === "event") {
    return buildEventTaskCalendarCopy({
      task,
      eventName: context.eventName,
      t,
      locale,
    });
  }
  return buildTaskCalendarCopy({
    task,
    spaceName: context.spaceName,
    t,
    locale,
  });
}

export async function saveTaskFromForm(args: {
  tasks: NSKTask[];
  spaces: NSKSpace[];
  values: TaskFormValues;
  calendar: GoogleCalendarSubmitPrefs;
  editingTask: NSKTask | null;
  targetSpaceId: string;
  activeSpaceId: string | null;
  sessionKind: "anonymous" | "google";
  calendarContext: TaskCalendarContext;
  t: Messages;
  locale: Locale;
  requestCreateCalendarConfirm: () => Promise<boolean>;
  onCalendarSyncError: () => void;
  allowSpaceChange?: boolean;
}): Promise<SaveTaskResult> {
  const {
    tasks,
    spaces,
    values,
    calendar,
    editingTask,
    targetSpaceId,
    activeSpaceId,
    sessionKind,
    calendarContext,
    t,
    locale,
    requestCreateCalendarConfirm,
    onCalendarSyncError,
    allowSpaceChange = true,
  } = args;

  const now = new Date().toISOString();
  const due = values.due_date || undefined;

  if (editingTask) {
    const current = tasks.find((x) => x.id === editingTask.id) ?? editingTask;
    const status = current.status;
    const spaceChanged = allowSpaceChange && targetSpaceId !== current.space_id;
    let merged: NSKTask = {
      ...current,
      title: values.title,
      description: values.description || undefined,
      due_date: due,
      status,
      updated_at: now,
    };
    if (!spaceChanged) {
      merged = { ...merged, space_id: targetSpaceId };
    }

    if (merged.google_calendar_event_id && !due) {
      await nskCalendarDeleteEvent(merged.google_calendar_event_id);
      merged = {
        ...merged,
        google_calendar_event_id: undefined,
        google_calendar_email_reminder_minutes: undefined,
      };
    }

    if (sessionKind === "google" && due && calendar.enabled) {
      const contextName =
        calendarContext.kind === "event"
          ? calendarContext.eventName
          : spaces.find((s) => s.id === merged.space_id)?.name;
      const ctx: TaskCalendarContext =
        calendarContext.kind === "event"
          ? { kind: "event", eventName: contextName }
          : { kind: "space", spaceName: contextName };

      if (merged.google_calendar_event_id) {
        const { summary, description } = calendarCopy(merged, ctx, t, locale);
        const body = buildAllDayNskEventInput({
          summary,
          description,
          startDateYmd: due,
          reminderEmailMinutes:
            merged.google_calendar_email_reminder_minutes ?? calendar.reminderMinutes,
        });
        const patchBody: Partial<NskCalendarEventInput> = {
          summary: body.summary,
          description: body.description,
          start: body.start,
          end: body.end,
          reminders: body.reminders,
        };
        const ok = await nskCalendarPatchEvent(merged.google_calendar_event_id, patchBody);
        if (!ok) onCalendarSyncError();
      } else {
        const calendarId = await nskCalendarGetNoSheetKitCalendarId();
        if (calendarId === null) {
          const accepted = await requestCreateCalendarConfirm();
          if (!accepted) return { ok: false, cancelled: true };
        }
        const { summary, description } = calendarCopy(merged, ctx, t, locale);
        const body = buildAllDayNskEventInput({
          summary,
          description,
          startDateYmd: due,
          reminderEmailMinutes: calendar.reminderMinutes,
        });
        const created = await nskCalendarCreateEvent(body);
        if (created) {
          merged = {
            ...merged,
            google_calendar_event_id: created.id,
            google_calendar_email_reminder_minutes: calendar.reminderMinutes,
          };
        } else {
          onCalendarSyncError();
        }
      }
    }

    let nextTasks = tasks.map((x) => (x.id === editingTask.id ? merged : x));
    if (spaceChanged) {
      nextTasks = moveTaskToSpace(nextTasks, editingTask.id, targetSpaceId);
    }

    const navigateToSpaceId =
      spaceChanged && activeSpaceId !== targetSpaceId ? targetSpaceId : undefined;
    return { ok: true, tasks: nextTasks, navigateToSpaceId };
  }

  const order = nextOrderForColumn(tasks, targetSpaceId, "todo");
  const id = crypto.randomUUID();
  let row: NSKTask = {
    id,
    space_id: targetSpaceId,
    title: values.title,
    description: values.description || undefined,
    due_date: due,
    status: "todo",
    archived: false,
    order,
    created_at: now,
    updated_at: now,
    comments: [],
  };

  if (sessionKind === "google" && due && calendar.enabled) {
    const calendarId = await nskCalendarGetNoSheetKitCalendarId();
    if (calendarId === null) {
      const accepted = await requestCreateCalendarConfirm();
      if (!accepted) return { ok: false, cancelled: true };
    }
    const { summary, description } = calendarCopy(row, calendarContext, t, locale);
    const body = buildAllDayNskEventInput({
      summary,
      description,
      startDateYmd: due,
      reminderEmailMinutes: calendar.reminderMinutes,
    });
    const created = await nskCalendarCreateEvent(body);
    if (created) {
      row = {
        ...row,
        google_calendar_event_id: created.id,
        google_calendar_email_reminder_minutes: calendar.reminderMinutes,
      };
    } else {
      onCalendarSyncError();
    }
  }

  const navigateToSpaceId = targetSpaceId !== activeSpaceId ? targetSpaceId : undefined;
  return { ok: true, tasks: [...tasks, row], navigateToSpaceId };
}

export function addTaskComment(tasks: NSKTask[], taskId: string, body: string): NSKTask[] {
  const now = new Date().toISOString();
  const cid = crypto.randomUUID();
  return tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          updated_at: now,
          comments: [...x.comments, { id: cid, body, created_at: now, updated_at: now }],
        }
      : x
  );
}

export function updateTaskComment(
  tasks: NSKTask[],
  taskId: string,
  commentId: string,
  body: string
): NSKTask[] {
  const now = new Date().toISOString();
  return tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          updated_at: now,
          comments: x.comments.map((c) =>
            c.id === commentId ? { ...c, body, updated_at: now } : c
          ),
        }
      : x
  );
}

export function removeTaskComment(
  tasks: NSKTask[],
  taskId: string,
  commentId: string
): NSKTask[] {
  const now = new Date().toISOString();
  return tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          updated_at: now,
          comments: x.comments.filter((c) => c.id !== commentId),
        }
      : x
  );
}

export async function archiveTask(task: NSKTask): Promise<NSKTask> {
  if (task.status !== "done" || task.archived) return task;
  if (task.google_calendar_event_id) {
    await nskCalendarDeleteEvent(task.google_calendar_event_id);
  }
  const now = new Date().toISOString();
  return {
    ...task,
    archived: true,
    updated_at: now,
    google_calendar_event_id: undefined,
    google_calendar_email_reminder_minutes: undefined,
  };
}

export function applyArchivedTask(tasks: NSKTask[], archived: NSKTask): NSKTask[] {
  return tasks.map((x) => (x.id === archived.id ? archived : x));
}

export async function archiveAllDoneInSpace(
  tasks: NSKTask[],
  spaceId: string
): Promise<NSKTask[]> {
  const victims = tasks.filter(
    (t) => t.space_id === spaceId && t.status === "done" && !t.archived
  );
  if (victims.length === 0) return tasks;
  await Promise.all(
    victims.map((t) =>
      t.google_calendar_event_id ? nskCalendarDeleteEvent(t.google_calendar_event_id) : Promise.resolve()
    )
  );
  const now = new Date().toISOString();
  const ids = new Set(victims.map((t) => t.id));
  return tasks.map((x) =>
    ids.has(x.id)
      ? {
          ...x,
          archived: true,
          updated_at: now,
          google_calendar_event_id: undefined,
          google_calendar_email_reminder_minutes: undefined,
        }
      : x
  );
}

export function unarchiveTask(task: NSKTask): NSKTask {
  const now = new Date().toISOString();
  return { ...task, archived: false, updated_at: now };
}

export async function deleteTaskWithCalendar(task: NSKTask): Promise<void> {
  if (task.google_calendar_event_id) {
    await nskCalendarDeleteEvent(task.google_calendar_event_id);
  }
}

export function removeTaskFromList(tasks: NSKTask[], taskId: string): NSKTask[] {
  return tasks.filter((x) => x.id !== taskId);
}

export async function disconnectTaskCalendar(task: NSKTask): Promise<NSKTask> {
  if (!task.google_calendar_event_id) return task;
  await nskCalendarDeleteEvent(task.google_calendar_event_id);
  return {
    ...task,
    google_calendar_event_id: undefined,
    google_calendar_email_reminder_minutes: undefined,
  };
}

export function applyDisconnectedTask(tasks: NSKTask[], updated: NSKTask): NSKTask[] {
  return tasks.map((x) => (x.id === updated.id ? updated : x));
}

export async function deleteTasksWithCalendarCleanup(tasks: NSKTask[]): Promise<void> {
  await Promise.all(
    tasks.map((tk) =>
      tk.google_calendar_event_id ? nskCalendarDeleteEvent(tk.google_calendar_event_id) : Promise.resolve()
    )
  );
}

export function removeSpaceAndTasks(
  tasks: NSKTask[],
  spaces: NSKSpace[],
  spaceId: string
): { tasks: NSKTask[]; spaces: NSKSpace[] } {
  return {
    spaces: spaces.filter((s) => s.id !== spaceId),
    tasks: tasks.filter((t) => t.space_id !== spaceId),
  };
}

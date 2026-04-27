"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { NaturalDateField } from "@/components/common/natural-date-field";
import {
  GoogleCalendarEventOptions,
  type GoogleCalendarSubmitPrefs,
} from "@/components/common/google-calendar-event-options";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAppsSessionKind } from "@/lib/storage/session-storage-context";
import { defaultReminderMinutesForAppKind } from "@/lib/google/calendar-constants";
import type { NSKTask, NSKTaskComment } from "@/lib/tasks/schema";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

type TaskFormValues = {
  title: string;
  description: string;
  due_date: string;
};

type AddTaskSheetProps = {
  open: boolean;
  editingItem: NSKTask | null;
  onClose: () => void;
  onSaveTask: (values: TaskFormValues, calendar: GoogleCalendarSubmitPrefs) => boolean | Promise<boolean>;
  onDisconnectGoogleCalendar?: () => void | Promise<void>;
  onAddComment: (taskId: string, body: string) => void;
  onUpdateComment: (taskId: string, commentId: string, body: string) => void;
  onDeleteComment: (taskId: string, commentId: string) => void;
};

const DEFAULT_FORM: TaskFormValues = {
  title: "",
  description: "",
  due_date: "",
};

export function AddTaskSheet({
  open,
  editingItem,
  onClose,
  onSaveTask,
  onDisconnectGoogleCalendar,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: AddTaskSheetProps) {
  const { t, locale } = useI18n();
  const sessionKind = useAppsSessionKind();
  const [form, setForm] = useState<TaskFormValues>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(() =>
    defaultReminderMinutesForAppKind("tasks")
  );
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingItem) {
        setForm({
          title: editingItem.title,
          description: editingItem.description ?? "",
          due_date: editingItem.due_date ?? "",
        });
        setAddToCalendar(Boolean(editingItem.google_calendar_event_id));
        setReminderMinutes(
          editingItem.google_calendar_email_reminder_minutes ??
            defaultReminderMinutesForAppKind("tasks")
        );
      } else {
        setForm({ ...DEFAULT_FORM });
        setAddToCalendar(false);
        setReminderMinutes(defaultReminderMinutesForAppKind("tasks"));
      }
      setError(null);
      setNewComment("");
      setEditingCommentId(null);
      setEditingCommentBody("");
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting form when only `editingItem` (e.g. comments) updates for the same task id
  }, [open, editingItem?.id]);

  const showGoogleCalendar = sessionKind === "google" && Boolean(form.due_date.trim());

  async function handleSaveTask() {
    if (isSaving) return;
    const title = form.title.trim();
    if (!title) {
      setError(t.tasks.errors.titleRequired);
      return;
    }
    const due = form.due_date.trim();
    const linked = Boolean(editingItem?.google_calendar_event_id);
    const calendar: GoogleCalendarSubmitPrefs = {
      enabled: sessionKind === "google" && Boolean(due) && (linked || addToCalendar),
      reminderMinutes,
    };
    setIsSaving(true);
    try {
      const saved = await onSaveTask(
        {
          ...form,
          title,
          description: form.description.trim() || "",
          due_date: due,
        },
        calendar
      );
      if (saved) onClose();
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddComment() {
    if (!editingItem) return;
    const body = newComment.trim();
    if (!body) return;
    onAddComment(editingItem.id, body);
    setNewComment("");
  }

  function startEditComment(c: NSKTaskComment) {
    setEditingCommentId(c.id);
    setEditingCommentBody(c.body);
  }

  function saveEditComment() {
    if (!editingItem || !editingCommentId) return;
    const body = editingCommentBody.trim();
    if (!body) return;
    onUpdateComment(editingItem.id, editingCommentId, body);
    setEditingCommentId(null);
    setEditingCommentBody("");
  }

  const comments = editingItem?.comments ?? [];
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[460px]">
        <SheetHeader>
          <SheetTitle>{editingItem ? t.tasks.editTask : t.tasks.addTask}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-4">
          <Field>
            <FieldLabel>
              {t.tasks.fields.title}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t.tasks.fields.titlePlaceholder}
            />
          </Field>

          <Field>
            <FieldLabel>{t.tasks.fields.description}</FieldLabel>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t.tasks.fields.descriptionPlaceholder}
              rows={3}
            />
          </Field>

          <NaturalDateField
            id="nsk-tasks-due-natural"
            locale={locale}
            label={t.tasks.fields.dueDate}
            hint={t.tasks.fields.dueDateHint}
            placeholder={t.tasks.fields.dueDateNaturalPlaceholder}
            valueIso={form.due_date}
            onChangeIso={(iso) => setForm((f) => ({ ...f, due_date: iso }))}
          />

          <GoogleCalendarEventOptions
            visible={showGoogleCalendar}
            linkedEventId={editingItem?.google_calendar_event_id}
            storedReminderMinutes={editingItem?.google_calendar_email_reminder_minutes}
            addToCalendar={addToCalendar}
            onAddToCalendarChange={setAddToCalendar}
            reminderMinutes={reminderMinutes}
            onReminderMinutesChange={setReminderMinutes}
            onRemoveFromCalendar={async () => {
              await onDisconnectGoogleCalendar?.();
            }}
            t={t}
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {editingItem ? (
            <div className="border-t border-border pt-4">
              <h4 className="mb-2 text-sm font-medium">{t.tasks.fields.comments}</h4>
              <ul className="mb-3 space-y-2">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-md border border-border/80 p-2 text-sm">
                    {editingCommentId === c.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingCommentBody}
                          onChange={(e) => setEditingCommentBody(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={saveEditComment}>
                            {t.tasks.fields.editComment}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentBody("");
                            }}
                          >
                            {t.tasks.cancel}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 whitespace-pre-wrap">{c.body}</p>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => startEditComment(c)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => onDeleteComment(editingItem.id, c.id)}
                          >
                            <Trash2 className="size-4 text-destructive" aria-hidden />
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t.tasks.fields.commentPlaceholder}
                  rows={2}
                />
                <Button type="button" variant="secondary" onClick={handleAddComment}>
                  {t.tasks.fields.addComment}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <SheetFooter className="flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {t.tasks.cancel}
          </Button>
          <Button type="button" onClick={() => void handleSaveTask()} disabled={isSaving}>
            {t.tasks.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

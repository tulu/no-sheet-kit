"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { NaturalDateField } from "@/components/common/natural-date-field";
import { useI18n } from "@/components/providers/i18n-provider";
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
  onSaveTask: (values: TaskFormValues) => void;
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
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: AddTaskSheetProps) {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<TaskFormValues>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
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
      } else {
        setForm({ ...DEFAULT_FORM });
      }
      setError(null);
      setNewComment("");
      setEditingCommentId(null);
      setEditingCommentBody("");
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting form when only `editingItem` (e.g. comments) updates for the same task id
  }, [open, editingItem?.id]);

  function handleSaveTask() {
    const title = form.title.trim();
    if (!title) {
      setError(t.tasks.errors.titleRequired);
      return;
    }
    onSaveTask({
      ...form,
      title,
      description: form.description.trim() || "",
      due_date: form.due_date.trim(),
    });
    onClose();
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
      <SheetContent side="right" className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editingItem ? t.tasks.editTask : t.tasks.addTask}</SheetTitle>
        </SheetHeader>

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
                        <Button type="button" size="icon-sm" variant="ghost" onClick={() => startEditComment(c)}>
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

        <SheetFooter className="mt-auto flex-row gap-2 border-t border-border pt-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.tasks.cancel}
          </Button>
          <Button type="button" onClick={handleSaveTask}>
            {t.tasks.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

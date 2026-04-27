"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { NaturalDateField } from "@/components/common/natural-date-field";
import {
  GoogleCalendarEventOptions,
  type GoogleCalendarSubmitPrefs,
} from "@/components/common/google-calendar-event-options";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAppsSessionKind } from "@/lib/storage/session-storage-context";
import { defaultReminderMinutesForAppKind } from "@/lib/google/calendar-constants";
import type { NSKLinkItem } from "@/lib/links/schema";
import { parseTagsInput, tagsInputValue, toValidHttpUrl } from "@/lib/links/links-helpers";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

type LinkFormValues = {
  url: string;
  manualTags: string[];
  reviewed: boolean;
  reviewDueDate?: string;
};

type AddLinkSheetProps = {
  open: boolean;
  editingItem: NSKLinkItem | null;
  onClose: () => void;
  onSubmit: (values: LinkFormValues, calendar: GoogleCalendarSubmitPrefs) => void | Promise<void>;
  onDisconnectGoogleCalendar?: () => void | Promise<void>;
};

type FormState = {
  url: string;
  tags: string;
  reviewed: boolean;
  reviewDueDate: string;
};

const DEFAULT_FORM: FormState = {
  url: "",
  tags: "",
  reviewed: false,
  reviewDueDate: "",
};

export function AddLinkSheet({
  open,
  editingItem,
  onClose,
  onSubmit,
  onDisconnectGoogleCalendar,
}: AddLinkSheetProps) {
  const { t, locale } = useI18n();
  const sessionKind = useAppsSessionKind();
  const baseId = useId();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(() =>
    defaultReminderMinutesForAppKind("links")
  );

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (!editingItem) {
        setForm(DEFAULT_FORM);
        setAddToCalendar(false);
        setReminderMinutes(defaultReminderMinutesForAppKind("links"));
      } else {
        setForm({
          url: editingItem.url,
          tags: tagsInputValue(editingItem.manual_tags),
          reviewed: editingItem.reviewed,
          reviewDueDate: editingItem.review_due_date ?? "",
        });
        setAddToCalendar(Boolean(editingItem.google_calendar_event_id));
        setReminderMinutes(
          editingItem.google_calendar_email_reminder_minutes ??
            defaultReminderMinutesForAppKind("links")
        );
      }
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingItem]);

  const showGoogleCalendar = sessionKind === "google" && Boolean(form.reviewDueDate.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;
    const parsed = toValidHttpUrl(form.url);
    if (!parsed) {
      setError(t.links.errors.urlInvalid);
      return;
    }
    setError(null);
    const due = form.reviewDueDate.trim() || undefined;
    const linked = Boolean(editingItem?.google_calendar_event_id);
    const calendar: GoogleCalendarSubmitPrefs = {
      enabled: sessionKind === "google" && Boolean(due) && (linked || addToCalendar),
      reminderMinutes,
    };
    setIsSaving(true);
    try {
      await onSubmit(
        {
          url: parsed.toString(),
          manualTags: parseTagsInput(form.tags),
          reviewed: form.reviewed,
          reviewDueDate: due,
        },
        calendar
      );
    } finally {
      setIsSaving(false);
    }
  }

  const title = editingItem ? t.links.editLink : t.links.addLink;
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={`${baseId}-url`}>
              {t.links.fields.url}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-url`}
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder={t.links.fields.urlPlaceholder}
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="url"
            />
            {error ? <FieldDescription className="text-destructive">{error}</FieldDescription> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor={`${baseId}-tags`}>{t.links.fields.tags}</FieldLabel>
            <Input
              id={`${baseId}-tags`}
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder={t.links.fields.tagsPlaceholder}
            />
          </Field>

          <NaturalDateField
            id={`${baseId}-review-due-date`}
            locale={locale}
            label={t.links.fields.reviewDueDate}
            hint={t.links.fields.reviewDueDateHint}
            placeholder={t.links.fields.reviewDueDatePlaceholder}
            valueIso={form.reviewDueDate}
            onChangeIso={(iso) => setForm((prev) => ({ ...prev, reviewDueDate: iso }))}
          />

          <Field>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
              <div className="space-y-0.5">
                <FieldLabel htmlFor={`${baseId}-reviewed`}>{t.links.fields.reviewed}</FieldLabel>
                <FieldDescription>{t.links.fields.reviewedHint}</FieldDescription>
              </div>
              <Switch
                id={`${baseId}-reviewed`}
                checked={form.reviewed}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, reviewed: Boolean(checked) }))}
              />
            </div>
          </Field>

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

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              {t.links.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {editingItem ? t.links.save : t.links.addNew}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { NaturalDateField } from "@/components/common/natural-date-field";
import { useI18n } from "@/components/providers/i18n-provider";
import { todayIsoDate, validateEntryTimes } from "@/lib/tracker/tracker-helpers";
import type { NSKTrackerEntry } from "@/lib/tracker/schema";

type AddEntrySheetProps = {
  open: boolean;
  editingEntry: NSKTrackerEntry | null;
  defaultOccurredOn?: string;
  onClose: () => void;
  onSubmit: (values: {
    occurred_on: string;
    start_time: string;
    end_time: string;
    notes: string;
  }) => void;
};

export function AddEntrySheet({
  open,
  editingEntry,
  defaultOccurredOn,
  onClose,
  onSubmit,
}: AddEntrySheetProps) {
  const { locale, t } = useI18n();
  const baseId = useId();
  const [occurredOn, setOccurredOn] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingEntry) {
        setOccurredOn(editingEntry.occurred_on);
        setStartTime(editingEntry.start_time ?? "");
        setEndTime(editingEntry.end_time ?? "");
        setNotes(editingEntry.notes ?? "");
      } else {
        setOccurredOn(defaultOccurredOn ?? todayIsoDate());
        setStartTime("");
        setEndTime("");
        setNotes("");
      }
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingEntry, defaultOccurredOn]);

  function handleSubmit() {
    if (!occurredOn.trim()) {
      setError(t.tracker.errors.dateRequired);
      return;
    }
    const timeError = validateEntryTimes(startTime, endTime);
    if (timeError === "invalid_start") {
      setError(t.tracker.errors.invalidStartTime);
      return;
    }
    if (timeError === "invalid_end") {
      setError(t.tracker.errors.invalidEndTime);
      return;
    }
    if (timeError === "end_before_start") {
      setError(t.tracker.errors.endBeforeStart);
      return;
    }
    onSubmit({
      occurred_on: occurredOn,
      start_time: startTime.trim(),
      end_time: endTime.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[460px]">
        <SheetHeader>
          <SheetTitle>{editingEntry ? t.tracker.editEntry : t.tracker.addEntry}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto px-4 pb-4">
          <NaturalDateField
            id={`${baseId}-occurred-on`}
            locale={locale}
            label={t.tracker.fields.occurredOn}
            hint={t.tracker.fields.occurredOnHint}
            placeholder={t.tracker.fields.occurredOnPlaceholder}
            valueIso={occurredOn}
            onChangeIso={setOccurredOn}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${baseId}-start`}>{t.tracker.fields.startTime}</FieldLabel>
              <Input
                id={`${baseId}-start`}
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError(null);
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${baseId}-end`}>{t.tracker.fields.endTime}</FieldLabel>
              <Input
                id={`${baseId}-end`}
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor={`${baseId}-notes`}>{t.tracker.fields.notes}</FieldLabel>
            <Textarea
              id={`${baseId}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t.tracker.fields.notesPlaceholder}
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="mt-auto flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.tracker.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t.tracker.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

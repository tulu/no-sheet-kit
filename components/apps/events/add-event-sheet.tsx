"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { NaturalDateField } from "@/components/common/natural-date-field";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKEvent } from "@/lib/events/schema";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

export type EventFormValues = {
  name: string;
  start_date: string;
  start_time: string;
  location: string;
};

type AddEventSheetProps = {
  open: boolean;
  editingEvent: NSKEvent | null;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
};

export function AddEventSheet({ open, editingEvent, onClose, onSubmit }: AddEventSheetProps) {
  const { locale, t } = useI18n();
  const baseId = useId();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingEvent) {
        setName(editingEvent.name);
        setStartDate(editingEvent.start_date ?? "");
        setStartTime(editingEvent.start_time ?? "");
        setLocation(editingEvent.location ?? "");
      } else {
        setName("");
        setStartDate("");
        setStartTime("");
        setLocation("");
      }
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingEvent]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.events.errors.eventNameRequired);
      return;
    }
    onSubmit({
      name: trimmed,
      start_date: startDate.trim(),
      start_time: startTime.trim(),
      location: location.trim(),
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[460px]">
        <SheetHeader>
          <SheetTitle>{editingEvent ? t.events.editEvent : t.events.addEvent}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto px-4 pb-4">
          <Field>
            <FieldLabel htmlFor={`${baseId}-name`}>
              {t.events.fields.eventName}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-name`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={t.events.fields.eventNamePlaceholder}
              autoFocus
            />
          </Field>
          {open ? (
            <NaturalDateField
              key={editingEvent?.id ?? "new"}
              id={`${baseId}-start-date`}
              locale={locale}
              label={t.events.fields.startDate}
              hint={t.events.fields.dateHint}
              placeholder={t.events.fields.dateNaturalPlaceholder}
              valueIso={startDate}
              onChangeIso={setStartDate}
            />
          ) : null}
          <Field>
            <FieldLabel htmlFor={`${baseId}-start-time`}>{t.events.fields.startTime}</FieldLabel>
            <Input
              id={`${baseId}-start-time`}
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${baseId}-location`}>{t.events.fields.location}</FieldLabel>
            <Input
              id={`${baseId}-location`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.events.fields.locationPlaceholder}
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="mt-auto flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.events.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t.events.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

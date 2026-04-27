"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import type { Messages } from "@/lib/i18n/messages";
import {
  CALENDAR_EMAIL_REMINDER_1_DAY,
  CALENDAR_EMAIL_REMINDER_1_WEEK,
  CALENDAR_EMAIL_REMINDER_30_DAYS,
  CALENDAR_EMAIL_REMINDER_SAME_DAY,
  CALENDAR_REMINDER_PRESETS,
} from "@/lib/google/calendar-constants";

export type GoogleCalendarSubmitPrefs = {
  enabled: boolean;
  reminderMinutes: number;
};

type GoogleCalendarEventOptionsProps = {
  visible: boolean;
  linkedEventId: string | undefined;
  storedReminderMinutes: number | undefined;
  addToCalendar: boolean;
  onAddToCalendarChange: (v: boolean) => void;
  reminderMinutes: number;
  onReminderMinutesChange: (v: number) => void;
  onRemoveFromCalendar: () => void | Promise<void>;
  t: Messages;
};

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleCalendarEventOptions({
  visible,
  linkedEventId,
  storedReminderMinutes,
  addToCalendar,
  onAddToCalendarChange,
  reminderMinutes,
  onReminderMinutesChange,
  onRemoveFromCalendar,
  t,
}: GoogleCalendarEventOptionsProps) {
  const [removeBusy, setRemoveBusy] = useState(false);
  const gc = t.googleCalendar;
  const linked = Boolean(linkedEventId);
  const effectiveReminder = linked ? (storedReminderMinutes ?? reminderMinutes) : reminderMinutes;

  function reminderLabel(minutes: number): string {
    switch (minutes) {
      case CALENDAR_EMAIL_REMINDER_SAME_DAY:
        return gc.reminderSameDay;
      case CALENDAR_EMAIL_REMINDER_1_DAY:
        return gc.reminder1DayBefore;
      case CALENDAR_EMAIL_REMINDER_1_WEEK:
        return gc.reminder1WeekBefore;
      case CALENDAR_EMAIL_REMINDER_30_DAYS:
        return gc.reminder30DaysBefore;
      default:
        return gc.reminderSameDay;
    }
  }

  async function handleRemove() {
    setRemoveBusy(true);
    try {
      await onRemoveFromCalendar();
    } finally {
      setRemoveBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <section className="space-y-3 pt-1">
      <h3 className="border-b border-border pb-1 text-sm font-semibold text-foreground">
        <span className="inline-flex items-center gap-1.5">
          <GoogleIcon />
          <span>{gc.sectionTitle}</span>
        </span>
      </h3>
      {linked ? (
        <p className="text-xs text-muted-foreground">{gc.linkedBadge}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-none">{gc.addToGoogleCalendar}</p>
          <p className="text-xs text-muted-foreground">{gc.addToGoogleCalendarHint}</p>
        </div>
        <Switch
          checked={linked ? true : addToCalendar}
          disabled={linked}
          onCheckedChange={(c) => onAddToCalendarChange(Boolean(c))}
          aria-label={gc.addToGoogleCalendar}
        />
      </div>

      <Field>
        <FieldLabel>{gc.emailReminder}</FieldLabel>
        <Select
          value={String(effectiveReminder)}
          onValueChange={(v) => onReminderMinutesChange(Number(v))}
          disabled={linked || !addToCalendar}
          itemToStringLabel={(v) => reminderLabel(Number(v))}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CALENDAR_REMINDER_PRESETS.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {reminderLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {linked ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          disabled={removeBusy}
          onClick={() => void handleRemove()}
        >
          {gc.removeFromCalendar}
        </Button>
      ) : null}
    </section>
  );
}

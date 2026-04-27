/** All-day event email reminders: minutes before start (multiples of 1440 or 0 per Google). */
export const CALENDAR_EMAIL_REMINDER_SAME_DAY = 0;
export const CALENDAR_EMAIL_REMINDER_1_DAY = 1440;
export const CALENDAR_EMAIL_REMINDER_1_WEEK = 10080;
export const CALENDAR_EMAIL_REMINDER_30_DAYS = 43200;

export const CALENDAR_REMINDER_PRESETS = [
  CALENDAR_EMAIL_REMINDER_SAME_DAY,
  CALENDAR_EMAIL_REMINDER_1_DAY,
  CALENDAR_EMAIL_REMINDER_1_WEEK,
  CALENDAR_EMAIL_REMINDER_30_DAYS,
] as const;

export type CalendarAppKind = "dates" | "domains" | "links" | "tasks";

export function defaultReminderMinutesForAppKind(kind: CalendarAppKind): number {
  if (kind === "domains") return CALENDAR_EMAIL_REMINDER_30_DAYS;
  return CALENDAR_EMAIL_REMINDER_SAME_DAY;
}

export function emailReminderPayload(minutes: number) {
  return {
    useDefault: false as const,
    overrides: [{ method: "email" as const, minutes }],
  };
}

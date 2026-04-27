import { occurrenceInYear } from "@/lib/dates/dates-helpers";
import type { NskCalendarEventInput } from "./google-calendar";
import { emailReminderPayload } from "./calendar-constants";

export function addOneCalendarDay(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** RRULE uses BYMONTH 1–12 and BYMONTHDAY. */
export function yearlyRecurrenceFromMonthDay(month0Indexed: number, day: number): string[] {
  const byMonth = month0Indexed + 1;
  return [`RRULE:FREQ=YEARLY;BYMONTH=${byMonth};BYMONTHDAY=${day}`];
}

/**
 * All-day event body. For recurring Dates, pass `recurrence` and `startDateYmd` as a concrete
 * instance on the stored anchor (month/day + anchor year).
 */
export function buildAllDayNskEventInput(args: {
  summary: string;
  description?: string;
  startDateYmd: string;
  reminderEmailMinutes: number;
  recurrence?: string[];
}): NskCalendarEventInput {
  return {
    summary: args.summary,
    ...(args.description !== undefined && args.description.length > 0
      ? { description: args.description }
      : {}),
    start: { date: args.startDateYmd },
    end: { date: addOneCalendarDay(args.startDateYmd) },
    reminders: emailReminderPayload(args.reminderEmailMinutes),
    ...(args.recurrence && args.recurrence.length > 0 ? { recurrence: args.recurrence } : {}),
  };
}

/** Start YMD for a Dates item (recurring uses anchor year + occurrenceInYear for Feb 29). */
export function startYmdForDateItem(dateIso: string, isRecurring: boolean): string | null {
  const src = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(src.getTime())) return null;
  if (!isRecurring) return toYmd(src);
  const y = src.getFullYear();
  const occ = occurrenceInYear(src.getMonth(), src.getDate(), y);
  return toYmd(occ);
}

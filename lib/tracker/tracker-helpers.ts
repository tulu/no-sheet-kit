import { tokensMatchHaystack } from "@/lib/apps/filter-items-by-search";
import type { Locale } from "@/lib/i18n/types";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { NSKTrackerEntry, NSKTrackerTrack } from "./schema";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidTrackerTime(value: string): boolean {
  return TIME_RE.test(value);
}

export function isValidTrackerDate(value: string): boolean {
  return DATE_RE.test(value);
}

export function sortTracks(tracks: NSKTrackerTrack[]): NSKTrackerTrack[] {
  return [...tracks].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function entriesInTrack(entries: NSKTrackerEntry[], trackId: string): NSKTrackerEntry[] {
  return entries.filter((e) => e.track_id === trackId);
}

export function compareEntriesForDisplay(a: NSKTrackerEntry, b: NSKTrackerEntry): number {
  const byDate = b.occurred_on.localeCompare(a.occurred_on);
  if (byDate !== 0) return byDate;
  const aStart = a.start_time ?? "";
  const bStart = b.start_time ?? "";
  const byStart = bStart.localeCompare(aStart);
  if (byStart !== 0) return byStart;
  return b.created_at.localeCompare(a.created_at);
}

export function sortEntriesForDisplay(entries: NSKTrackerEntry[]): NSKTrackerEntry[] {
  return [...entries].sort(compareEntriesForDisplay);
}

/** Chronological order within a calendar month block (grid grouping). */
export function compareEntriesWithinMonthAsc(a: NSKTrackerEntry, b: NSKTrackerEntry): number {
  const byDate = a.occurred_on.localeCompare(b.occurred_on);
  if (byDate !== 0) return byDate;
  const aStart = a.start_time ?? "";
  const bStart = b.start_time ?? "";
  const byStart = aStart.localeCompare(bStart);
  if (byStart !== 0) return byStart;
  return a.created_at.localeCompare(b.created_at);
}

export function yearMonthKey(year: number, month: number): string {
  return `${year}-${month}`;
}

export function parseYearMonthKey(key: string): { year: number; month: number } {
  const [ys, ms] = key.split("-");
  return { year: Number(ys), month: Number(ms) };
}

export function monthYearLabel(locale: Locale, year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat(getIntlLocaleTag(locale), {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

function entryYearMonth(entry: NSKTrackerEntry): { year: number; month: number } | null {
  const d = parseISODate(entry.occurred_on);
  if (!d) return null;
  return { year: d.getFullYear(), month: d.getMonth() };
}

function calendarMonthIndex(year: number, month: number): number {
  return year * 12 + month;
}

/** True when the entry falls in a calendar month before the current one. */
export function isEntryInPastCalendarMonth(entry: NSKTrackerEntry, now: Date = new Date()): boolean {
  const ym = entryYearMonth(entry);
  if (!ym) return false;
  const entryIndex = calendarMonthIndex(ym.year, ym.month);
  const nowIndex = calendarMonthIndex(now.getFullYear(), now.getMonth());
  return entryIndex < nowIndex;
}

export function buildEntriesYearMonthBucketMap(
  entries: NSKTrackerEntry[],
  mode: "upcoming" | "past",
  now: Date = new Date()
): Map<string, NSKTrackerEntry[]> {
  const map = new Map<string, NSKTrackerEntry[]>();
  for (const entry of entries) {
    const inPastMonth = isEntryInPastCalendarMonth(entry, now);
    if (mode === "upcoming" && inPastMonth) continue;
    if (mode === "past" && !inPastMonth) continue;

    const ym = entryYearMonth(entry);
    if (!ym) continue;
    const key = yearMonthKey(ym.year, ym.month);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  for (const list of map.values()) {
    list.sort(compareEntriesWithinMonthAsc);
  }
  return map;
}

export function sortedYearMonthKeys(keys: string[], order: "asc" | "desc"): string[] {
  const parsed = keys.map((k) => ({ k, ...parseYearMonthKey(k) }));
  parsed.sort((a, b) => {
    if (a.year !== b.year) return order === "asc" ? a.year - b.year : b.year - a.year;
    return order === "asc" ? a.month - b.month : b.month - a.month;
  });
  return parsed.map((p) => p.k);
}

function parseISODate(value: string): Date | null {
  if (!DATE_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameCalendarDay(isoDate: string, day: Date): boolean {
  const entry = parseISODate(isoDate);
  if (!entry) return false;
  return (
    entry.getFullYear() === day.getFullYear() &&
    entry.getMonth() === day.getMonth() &&
    entry.getDate() === day.getDate()
  );
}

export function entriesOnCalendarDay(entries: NSKTrackerEntry[], day: Date): NSKTrackerEntry[] {
  return sortEntriesForDisplay(entries.filter((e) => sameCalendarDay(e.occurred_on, day)));
}

export function entryMatchesSearch(entry: NSKTrackerEntry, query: string): boolean {
  if (!query.trim()) return true;
  const hay = [
    entry.occurred_on,
    entry.start_time ?? "",
    entry.end_time ?? "",
    entry.notes ?? "",
    formatEntryTimeRange(entry),
  ].join("\n");
  return tokensMatchHaystack(query, hay);
}

export function formatEntryTimeRange(entry: NSKTrackerEntry): string {
  const { start_time, end_time } = entry;
  if (start_time && end_time) return `${start_time}–${end_time}`;
  if (start_time) return start_time;
  if (end_time) return end_time;
  return "";
}

export function formatTrackerDateLong(isoDate: string, locale: Locale): string {
  const d = parseISODate(isoDate);
  if (!d) return isoDate;
  return new Intl.DateTimeFormat(getIntlLocaleTag(locale), {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatTrackerDateShort(isoDate: string, locale: Locale): string {
  const d = parseISODate(isoDate);
  if (!d) return isoDate;
  return new Intl.DateTimeFormat(getIntlLocaleTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function validateEntryTimes(
  startTime: string,
  endTime: string
): "invalid_start" | "invalid_end" | "end_before_start" | null {
  const start = startTime.trim();
  const end = endTime.trim();
  if (start && !isValidTrackerTime(start)) return "invalid_start";
  if (end && !isValidTrackerTime(end)) return "invalid_end";
  if (start && end && end < start) return "end_before_start";
  return null;
}

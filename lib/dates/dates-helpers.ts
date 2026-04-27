import { tokensMatchHaystack } from "@/lib/apps/filter-items-by-search";
import type { NSKDateItem } from "./schema";

// --- Month grid (6×7 cells) ---

/** 6 weeks × 7 days, aligned to `weekStartsOn` (0 = Sunday, 1 = Monday). */
export function getMonthGridDates(anchorMonth: Date, weekStartsOn: 0 | 1): Date[] {
  const y = anchorMonth.getFullYear();
  const m = anchorMonth.getMonth();
  const firstOfMonth = new Date(y, m, 1);
  const startDow = firstOfMonth.getDay();
  const offset = (startDow - weekStartsOn + 7) % 7;
  const start = new Date(y, m, 1 - offset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

// --- Calendar day / occurrences ---

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function parseItemLocalDate(item: NSKDateItem): Date | null {
  const d = new Date(`${item.date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Items that appear on this calendar day (local date) in the visible month grid.
 * Non-recurring: exact Y-M-D match. Recurring: same month/day every year; Feb 29 shows on Feb 28 in non-leap years.
 */
export function getItemsForDay(items: NSKDateItem[], day: Date): NSKDateItem[] {
  const y = day.getFullYear();
  const m = day.getMonth();
  const dom = day.getDate();
  const out: NSKDateItem[] = [];

  for (const item of items) {
    const src = parseItemLocalDate(item);
    if (!src) continue;

    if (!item.is_recurring) {
      if (src.getFullYear() === y && src.getMonth() === m && src.getDate() === dom) {
        out.push(item);
      }
      continue;
    }

    if (y < src.getFullYear()) {
      continue;
    }

    const sm = src.getMonth();
    const sd = src.getDate();

    if (sm === m && sd === dom) {
      out.push(item);
      continue;
    }

    if (sm === 1 && sd === 29 && m === 1 && dom === 28 && !isLeapYear(y)) {
      out.push(item);
    }
  }

  return out;
}

// --- Sort by occurrence from today ---

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Month (0–11) and calendar day; Feb 29 becomes Feb 28 in non-leap years. */
export function occurrenceInYear(month: number, day: number, year: number): Date {
  if (month === 1 && day === 29 && !isLeapYear(year)) {
    return new Date(year, 1, 28, 0, 0, 0, 0);
  }
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Recurring item with anchor before today: the latest month/day occurrence strictly before
 * `now` (start of local day). Used for past sorting and grid past buckets.
 */
export function getLastPassedRecurringOccurrence(item: NSKDateItem, now: Date): Date | null {
  const src = parseItemLocalDate(item);
  if (!src || !item.is_recurring) return null;
  const today = startOfLocalDay(now);
  const anchor = startOfLocalDay(src);
  if (anchor.getTime() >= today.getTime()) return null;

  const m = src.getMonth();
  const d = src.getDate();
  const y = today.getFullYear();
  let occ = startOfLocalDay(occurrenceInYear(m, d, y));
  if (occ.getTime() >= today.getTime()) {
    occ = startOfLocalDay(occurrenceInYear(m, d, y - 1));
  }
  return occ;
}

/**
 * True if the item's relevant date this cycle is strictly before local today.
 * Recurring (anchor in the past): compares this calendar year's month/day to today — e.g. in
 * April, March birthdays are past for this cycle even though the next March is next year.
 */
export function isOccurrenceStrictlyPast(item: NSKDateItem, now: Date = new Date()): boolean {
  const src = parseItemLocalDate(item);
  if (!src) return false;
  const t0 = startOfLocalDay(now).getTime();
  if (!item.is_recurring) {
    return startOfLocalDay(src).getTime() < t0;
  }
  const anchor = startOfLocalDay(src);
  if (anchor.getTime() >= t0) {
    return false;
  }
  const y = startOfLocalDay(now).getFullYear();
  const tt = startOfLocalDay(occurrenceInYear(src.getMonth(), src.getDate(), y)).getTime();
  return tt < t0;
}

/**
 * List order for the dates table: past occurrences first (chronological by last
 * occurrence date, year-aware), then today and future (chronological by next
 * occurrence). Recurring items use the calendar-day-in-current-year rule
 * (aligned with the month grid).
 */
export function sortItemsByOccurrenceFromToday(
  items: NSKDateItem[],
  now: Date = new Date()
): NSKDateItem[] {
  type Tagged = { item: NSKDateItem; past: boolean; sortTime: number };

  const tagged: Tagged[] = [];

  for (const item of items) {
    const src = parseItemLocalDate(item);
    if (!src) {
      tagged.push({ item, past: false, sortTime: Number.MAX_SAFE_INTEGER });
      continue;
    }

    const past = isOccurrenceStrictlyPast(item, now);
    let sortTime: number;
    if (!item.is_recurring) {
      sortTime = startOfLocalDay(src).getTime();
    } else if (past) {
      const last = getLastPassedRecurringOccurrence(item, now);
      sortTime = last ? last.getTime() : startOfLocalDay(src).getTime();
    } else {
      const next = getNextOccurrenceDate(item, now);
      sortTime = next ? startOfLocalDay(next).getTime() : Number.MAX_SAFE_INTEGER;
    }
    tagged.push({ item, past, sortTime });
  }

  tagged.sort((a, b) => {
    if (a.past !== b.past) return a.past ? -1 : 1;
    if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime;
    return a.item.label.localeCompare(b.item.label);
  });

  return tagged.map((x) => x.item);
}

// --- Upcoming within 30 days ---

/**
 * Next calendar occurrence (local) for notifications and filters.
 * Non-recurring: stored Y-M-D. Recurring: if the stored date is still today or in the future,
 * that day is the next occurrence; otherwise the next month/day in this year or the next
 * (so pushing the anchor year forward hides yearly items until that year).
 */
export function getNextOccurrenceDate(item: NSKDateItem, now: Date): Date | null {
  const src = parseItemLocalDate(item);
  if (!src) return null;

  if (!item.is_recurring) {
    return src;
  }

  const today = startOfLocalDay(now);
  const anchor = startOfLocalDay(src);
  if (anchor.getTime() >= today.getTime()) {
    return anchor;
  }

  const month = src.getMonth();
  const day = src.getDate();
  const y = today.getFullYear();
  let cand = startOfLocalDay(occurrenceInYear(month, day, y));
  if (cand.getTime() < today.getTime()) {
    cand = startOfLocalDay(occurrenceInYear(month, day, y + 1));
  }
  return cand;
}

/** Whether the next occurrence falls within the next 30 calendar days from now (inclusive of today). */
export function isUpcomingWithin30Days(item: NSKDateItem, now: Date = new Date()): boolean {
  const start = startOfLocalDay(now);
  const next = getNextOccurrenceDate(item, now);
  if (!next) return false;
  const delta = next.getTime() - start.getTime();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return delta >= 0 && delta <= thirtyDays;
}

function dateSearchHaystack(item: NSKDateItem): string {
  return [item.label, item.date, item.type_id, item.notes ?? "", item.is_recurring ? "recurring" : ""]
    .join(" ")
    .toLowerCase();
}

export function dateMatchesSearch(item: NSKDateItem, rawQuery: string): boolean {
  return tokensMatchHaystack(rawQuery, dateSearchHaystack(item));
}

import type { NSKDateItem } from "./schema";

export function parseItemLocalDate(item: NSKDateItem): Date | null {
  const d = new Date(`${item.date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
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

    const sm = src.getMonth();
    const sd = src.getDate();

    if (sm === m && sd === dom) {
      out.push(item);
      continue;
    }

    // Recurring Feb 29 → Feb 28 in non-leap years
    if (sm === 1 && sd === 29 && m === 1 && dom === 28 && !isLeapYear(y)) {
      out.push(item);
    }
  }

  return out;
}

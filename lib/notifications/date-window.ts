/** Local calendar day at midnight. */
export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Parse `YYYY-MM-DD` as local midnight. */
export function parseYmdLocal(ymd: string): Date | null {
  const t = ymd.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(`${t}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * True when `ymd` falls on a calendar day from local today through local today + 30 days
 * (same window rule as dates app `isUpcomingWithin30Days` delta).
 */
export function isYmdInNext30DaysInclusive(ymd: string, now: Date = new Date()): boolean {
  const target = parseYmdLocal(ymd);
  if (!target) return false;
  const start = startOfLocalDay(now);
  const delta = startOfLocalDay(target).getTime() - start.getTime();
  return delta >= 0 && delta <= THIRTY_DAYS_MS;
}

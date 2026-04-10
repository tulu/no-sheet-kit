/** Days before expiration to treat a domain as "expiring soon" (banner + filter). */
export const EXPIRING_SOON_DAYS = 30;

function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isExpiringSoon(expiresOn: string): boolean {
  const expiry = parseISODate(expiresOn);
  if (!expiry) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(expiry);
  end.setHours(0, 0, 0, 0);
  if (end < today) return false;
  const limit = new Date(today);
  limit.setDate(limit.getDate() + EXPIRING_SOON_DAYS);
  return end <= limit;
}

/** Whole calendar days from local “today” to `expiresOn` (midnight). Negative if already expired. */
export function getDaysUntilExpiry(expiresOn: string): number | null {
  const expiry = parseISODate(expiresOn);
  if (!expiry) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(expiry);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

import { tokensMatchHaystack } from "@/lib/apps/filter-items-by-search";
import type { NSKDomainItem } from "./schema";

// --- Expiry (banner + filter) ---

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

// --- Calendar day (domain expiry on grid) ---

function formatLocalYmd(day: Date): string {
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, "0");
  const d = String(day.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Domains whose `expires_on` (YYYY-MM-DD) matches the given local calendar day. */
export function getDomainItemsForExpiryDay(
  items: NSKDomainItem[],
  day: Date
): NSKDomainItem[] {
  const key = formatLocalYmd(day);
  const out: NSKDomainItem[] = [];
  for (const item of items) {
    const raw = item.expires_on?.trim();
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) continue;
    if (raw === key) out.push(item);
  }
  return out;
}

// --- Favicon URLs ---

/**
 * Normalize user input to a bare hostname (lowercase, no scheme, no leading www.).
 */
export function normalizeDomainHostname(input: string): string {
  const trimmed = input.trim().toLowerCase();
  const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return trimmed.replace(/^https?:\/\//, "").split("/")[0].split("?")[0].split("#")[0];
  }
}

/**
 * Favicon URLs to try in order: origin favicon, Google s2, local fallback asset.
 */
export function domainFaviconSources(domainName: string): string[] {
  const domain = normalizeDomainHostname(domainName);
  return [
    `https://${domain}/favicon.ico`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
    "/nsk-iso.svg",
  ];
}

// --- Site URL for “open in browser” ---

/** Build https URL for opening the site in a new tab; strips duplicate protocol. */
export function normalizeDomainSiteUrl(domainName: string): string {
  let host = domainName.trim();
  if (!host) return "";
  host = host.replace(/^https?:\/\//i, "");
  const slash = host.indexOf("/");
  if (slash >= 0) host = host.slice(0, slash);
  return `https://${host}`;
}

function domainSearchHaystack(item: NSKDomainItem): string {
  return [
    item.domain_name,
    item.registrar,
    item.status_id,
    item.purchased_at,
    item.expires_on,
    item.price,
    item.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function domainMatchesSearch(item: NSKDomainItem, rawQuery: string): boolean {
  return tokensMatchHaystack(rawQuery, domainSearchHaystack(item));
}

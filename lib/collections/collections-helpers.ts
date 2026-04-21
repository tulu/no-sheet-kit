import { tokensMatchHaystack } from "@/lib/apps/filter-items-by-search";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";
import type {
  NSKCollection,
  NSKCollectionItem,
  NSKCollectionsSchema,
  PossessionStatus,
} from "./schema";

export function sortCollections(collections: NSKCollection[]): NSKCollection[] {
  return [...collections].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function itemsInCollection(
  items: NSKCollectionItem[],
  collectionId: string
): NSKCollectionItem[] {
  return items
    .filter((i) => i.collection_id === collectionId)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

/** All items with a given status, sorted by collection order then item order. */
export function itemsByPossessionStatus(
  items: NSKCollectionItem[],
  collections: NSKCollection[],
  status: PossessionStatus
): NSKCollectionItem[] {
  const sortedCols = sortCollections(collections);
  const colIndex = new Map(sortedCols.map((c, i) => [c.id, i]));
  return items
    .filter((i) => i.possession_status === status)
    .sort((a, b) => {
      const ia = colIndex.get(a.collection_id) ?? 999;
      const ib = colIndex.get(b.collection_id) ?? 999;
      if (ia !== ib) return ia - ib;
      return a.order - b.order || a.name.localeCompare(b.name);
    });
}

export function nextOrderForCollection(
  items: NSKCollectionItem[],
  collectionId: string
): number {
  const inCol = items.filter((i) => i.collection_id === collectionId);
  if (inCol.length === 0) return 0;
  return Math.max(...inCol.map((i) => i.order), 0) + 1;
}

export function itemMatchesSearch(item: NSKCollectionItem, rawQuery: string): boolean {
  const parts = [
    item.name,
    item.notes ?? "",
    item.related_person ?? "",
    item.related_date ?? "",
    item.possession_status,
    item.price != null ? String(item.price) : "",
    item.currency ?? "",
    item.link ?? "",
  ];
  return tokensMatchHaystack(rawQuery, parts.join(" "));
}

const MAX_ITEM_LINK_LEN = 2048;

/** Rejects `javascript:`, `ftp:`, etc.; allows scheme-less hosts and explicit http(s). */
function hasDisallowedUrlScheme(trimmed: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed);
}

/**
 * Host must look like a real web target: not a single garbage label (`foo`).
 * Allows localhost, IPv4, IPv6 (colon in hostname from URL), and DNS names with a TLD ≥ 2 chars.
 */
function isPlausibleHttpHost(hostname: string): boolean {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  if (h === "localhost") return true;
  if (/^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/.test(h)) return true;
  if (h.includes(":")) return true;
  return /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(h);
}

/** Safe http(s) URL for opening in a new tab, or `null` if missing/invalid. */
export function itemLinkHref(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed.length > MAX_ITEM_LINK_LEN) return null;
  if (/\s/.test(trimmed)) return null;
  if (hasDisallowedUrlScheme(trimmed)) return null;
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname || u.hostname.length === 0) return null;
    if (!isPlausibleHttpHost(u.hostname)) return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Optional field: empty is valid; otherwise must yield a safe http(s) URL. */
export function isCollectionItemLinkInputValid(raw: string): boolean {
  const t = raw.trim();
  if (!t) return true;
  return itemLinkHref(t) !== null;
}

/** Localized amount only (no currency), for dashboard rows where the code is shown separately. */
export function formatCollectionAmountNumber(price: number, locale: Locale): string {
  return new Intl.NumberFormat(getIntlLocaleTag(locale), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(price);
}

/** Item/table: `CODE amount` (e.g. `UYU 333`) — ISO-style code + localized number, no symbol. */
export function formatCollectionPrice(
  price: number,
  currencyCode: string | undefined,
  locale: Locale
): string {
  const raw = currencyCode?.trim();
  const code = raw && raw.length > 0 ? raw.toUpperCase() : "USD";
  return `${code} ${formatCollectionAmountNumber(price, locale)}`;
}

export type CollectionValueByCurrencyRow = { currency: string; total: number };

/** Sums item prices per currency for items in collections that track price. */
export function totalCollectionValueByCurrency(
  items: NSKCollectionItem[],
  collections: NSKCollection[]
): CollectionValueByCurrencyRow[] {
  const showPriceByCol = new Map(collections.map((c) => [c.id, c.show_price]));
  const sums = new Map<string, { total: number; displayCurrency: string }>();
  for (const it of items) {
    if (!showPriceByCol.get(it.collection_id)) continue;
    if (it.price == null || !Number.isFinite(it.price)) continue;
    const raw =
      typeof it.currency === "string" && it.currency.trim() ? it.currency.trim() : "USD";
    const key = raw.toUpperCase();
    const prev = sums.get(key);
    if (prev) {
      prev.total += it.price;
    } else {
      sums.set(key, { total: it.price, displayCurrency: raw });
    }
  }
  return [...sums.entries()]
    .map(([, v]) => ({ currency: v.displayCurrency, total: v.total }))
    .sort((a, b) =>
      a.currency.toUpperCase().localeCompare(b.currency.toUpperCase(), undefined, {
        sensitivity: "base",
      })
    );
}

export type PossessionCounts = Record<PossessionStatus, number>;

export function countItemsByPossession(items: NSKCollectionItem[]): PossessionCounts {
  const base: PossessionCounts = { owned: 0, lent_out: 0, borrowed: 0, wanted: 0 };
  for (const it of items) {
    base[it.possession_status] += 1;
  }
  return base;
}

export function totalItems(schema: NSKCollectionsSchema): number {
  return schema.items.length;
}

export function lendingRelatedStatuses(item: NSKCollectionItem): boolean {
  return item.possession_status === "lent_out" || item.possession_status === "borrowed";
}

export function formatCollectionsDateShort(iso: string, locale: Locale): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.trim() ? iso : "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Long month name for sentence-style copy (e.g. card loan line). */
export function formatCollectionsDateLong(iso: string, locale: Locale): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.trim() ? iso : "";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

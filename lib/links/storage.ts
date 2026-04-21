"use client";

import {
  createEmptyNSKLinksSchema,
  isLinkStatus,
  NSKLINKS_SCHEMA_VERSION,
  NSKLINKS_STORAGE_KEY,
  type NSKLinkItem,
  type NSKLinksSchema,
} from "./schema";
import { dedupeTags, normalizeOptionalPublicHttpUrl, normalizeUrlInput } from "./links-helpers";

function normalizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return dedupeTags(raw.filter((x): x is string => typeof x === "string"));
}

function normalizeItems(rawItems: unknown): NSKLinkItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.reduce<NSKLinkItem[]>((acc, raw) => {
    if (!raw || typeof raw !== "object") return acc;
    const item = raw as Partial<NSKLinkItem> & { tags?: string[] };
    if (typeof item.url !== "string") return acc;
    const normalizedUrl = normalizeUrlInput(item.url);
    if (!normalizedUrl) return acc;

    const createdAt = typeof item.created_at === "string" ? item.created_at : new Date().toISOString();
    const updatedAt = typeof item.updated_at === "string" ? item.updated_at : createdAt;
    const reviewed = Boolean(item.reviewed);
    const legacyTags = normalizeTags(item.tags);

    acc.push({
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : crypto.randomUUID(),
      url: normalizedUrl,
      canonical_url: normalizeOptionalPublicHttpUrl(item.canonical_url),
      site_origin: normalizeOptionalPublicHttpUrl(item.site_origin),
      hostname: typeof item.hostname === "string" ? item.hostname.trim() || undefined : undefined,
      title: typeof item.title === "string" ? item.title.trim() || undefined : undefined,
      description: typeof item.description === "string" ? item.description.trim() || undefined : undefined,
      image_url: normalizeOptionalPublicHttpUrl(item.image_url),
      favicon_url: normalizeOptionalPublicHttpUrl(item.favicon_url),
      manual_tags: normalizeTags(item.manual_tags ?? legacyTags),
      auto_tags: normalizeTags(item.auto_tags),
      reviewed,
      reviewed_at: typeof item.reviewed_at === "string" ? item.reviewed_at : undefined,
      review_due_date: typeof item.review_due_date === "string" ? item.review_due_date : undefined,
      status: typeof item.status === "string" && isLinkStatus(item.status) ? item.status : "pending",
      error_message:
        typeof item.error_message === "string" ? item.error_message.trim() || undefined : undefined,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
}

export function readNSKLinksStorage(): NSKLinksSchema {
  if (typeof window === "undefined") return createEmptyNSKLinksSchema();
  const raw = window.localStorage.getItem(NSKLINKS_STORAGE_KEY);
  if (!raw) return createEmptyNSKLinksSchema();

  try {
    const parsed = JSON.parse(raw) as Partial<NSKLinksSchema> & { items?: unknown };
    return {
      version: NSKLINKS_SCHEMA_VERSION,
      items: normalizeItems(parsed.items),
    };
  } catch {
    return createEmptyNSKLinksSchema();
  }
}

export function writeNSKLinksStorage(next: NSKLinksSchema): void {
  if (typeof window === "undefined") return;
  const toPersist: NSKLinksSchema = {
    version: NSKLINKS_SCHEMA_VERSION,
    items: normalizeItems(next.items),
  };
  window.localStorage.setItem(NSKLINKS_STORAGE_KEY, JSON.stringify(toPersist));
}

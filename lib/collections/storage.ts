"use client";

import { emitListAppDataUpdated } from "@/lib/storage/list-app-data-updated";
import { markPendingDriveSync } from "@/lib/storage/pending-drive-sync";
import { buildNskListAppStorageKey } from "@/lib/storage/session-storage-keys";
import {
  createEmptyNSKCollectionsSchema,
  isPossessionStatus,
  NSKCOLLECTIONS_SCHEMA_VERSION,
  type NSKCollection,
  type NSKCollectionItem,
  type NSKCollectionsSchema,
  type PossessionStatus,
} from "./schema";

function normalizeCollections(raw: unknown): NSKCollection[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  const list = raw.reduce<NSKCollection[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const c = row as Partial<NSKCollection>;
    if (typeof c.name !== "string" || c.name.trim().length === 0) return acc;
    const createdAt = typeof c.created_at === "string" ? c.created_at : now;
    const updatedAt = typeof c.updated_at === "string" ? c.updated_at : createdAt;
    acc.push({
      id: typeof c.id === "string" && c.id.trim() ? c.id : crypto.randomUUID(),
      name: c.name.trim(),
      order: typeof c.order === "number" && Number.isFinite(c.order) ? c.order : acc.length,
      show_price: Boolean(c.show_price),
      show_link: Boolean(c.show_link),
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
  list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  return list;
}

function normalizeItems(raw: unknown, validCollectionIds: Set<string>): NSKCollectionItem[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  return raw.reduce<NSKCollectionItem[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const it = row as Partial<NSKCollectionItem>;
    if (typeof it.name !== "string" || it.name.trim().length === 0) return acc;
    if (typeof it.collection_id !== "string" || !validCollectionIds.has(it.collection_id)) {
      return acc;
    }
    const status: PossessionStatus =
      typeof it.possession_status === "string" && isPossessionStatus(it.possession_status)
        ? it.possession_status
        : "owned";
    const createdAt = typeof it.created_at === "string" ? it.created_at : now;
    const updatedAt = typeof it.updated_at === "string" ? it.updated_at : createdAt;
    const order = typeof it.order === "number" && Number.isFinite(it.order) ? it.order : 0;
    let price: number | undefined;
    if (typeof it.price === "number" && Number.isFinite(it.price)) {
      price = it.price;
    }
    const currencyRaw =
      typeof it.currency === "string" && it.currency.trim() ? it.currency.trim().toUpperCase() : "";
    const currency = price != null ? currencyRaw || "USD" : undefined;
    const relatedDate =
      typeof it.related_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(it.related_date)
        ? it.related_date
        : undefined;
    const relatedPerson =
      typeof it.related_person === "string" && it.related_person.trim()
        ? it.related_person.trim()
        : undefined;
    const linkRaw = typeof it.link === "string" ? it.link.trim() : "";
    const link =
      linkRaw.length > 0 && linkRaw.length <= 2048
        ? linkRaw
        : undefined;
    acc.push({
      id: typeof it.id === "string" && it.id.trim() ? it.id : crypto.randomUUID(),
      collection_id: it.collection_id,
      name: it.name.trim(),
      notes: typeof it.notes === "string" && it.notes.trim() ? it.notes.trim() : undefined,
      possession_status: status,
      related_date: relatedDate,
      related_person: relatedPerson,
      price,
      currency,
      link,
      order,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
}

export function readNSKCollectionsStorage(sessionSuffix: string): NSKCollectionsSchema {
  if (typeof window === "undefined") return createEmptyNSKCollectionsSchema();

  const key = buildNskListAppStorageKey("collections", sessionSuffix);
  const raw = window.localStorage.getItem(key);
  if (!raw) return createEmptyNSKCollectionsSchema();

  try {
    const parsed = JSON.parse(raw) as Partial<NSKCollectionsSchema> & {
      collections?: unknown;
      items?: unknown;
    };
    const collections = normalizeCollections(parsed.collections);
    if (collections.length === 0) {
      return createEmptyNSKCollectionsSchema();
    }
    const validIds = new Set(collections.map((c) => c.id));
    let items = normalizeItems(parsed.items, validIds);
    items = items.filter((i) => validIds.has(i.collection_id));

    return {
      version: NSKCOLLECTIONS_SCHEMA_VERSION,
      last_google_sync_at:
        typeof parsed.last_google_sync_at === "string" ? parsed.last_google_sync_at : null,
      collections,
      items,
    };
  } catch {
    return createEmptyNSKCollectionsSchema();
  }
}

export function writeNSKCollectionsStorage(
  sessionSuffix: string,
  next: NSKCollectionsSchema,
  opts?: { skipPendingDriveMark?: boolean }
) {
  if (typeof window === "undefined") return;
  const key = buildNskListAppStorageKey("collections", sessionSuffix);
  const validIds = new Set(next.collections.map((c) => c.id));
  const collections = normalizeCollections(next.collections);
  const items = normalizeItems(next.items, validIds);
  const payload: NSKCollectionsSchema = {
    version: NSKCOLLECTIONS_SCHEMA_VERSION,
    last_google_sync_at: next.last_google_sync_at ?? null,
    collections,
    items,
  };
  window.localStorage.setItem(key, JSON.stringify(payload));
  emitListAppDataUpdated(sessionSuffix);
  if (!opts?.skipPendingDriveMark) markPendingDriveSync(sessionSuffix);
}

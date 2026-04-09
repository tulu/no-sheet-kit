"use client";

import {
  createEmptyNSKDatesSchema,
  isDateTypeId,
  NSKDATES_SCHEMA_VERSION,
  NSKDATES_STORAGE_KEY,
  type DateTypeId,
  type NSKDateItem,
  type NSKDatesSchema,
} from "./schema";

function coerceTypeId(value: string | undefined): DateTypeId | null {
  if (!value) return null;
  if (value === "holiday") return "other";
  return isDateTypeId(value) ? value : null;
}

function normalizeItems(rawItems: unknown): NSKDateItem[] {
  if (!Array.isArray(rawItems)) return [];

  return rawItems.reduce<NSKDateItem[]>((acc, raw) => {
      if (!raw || typeof raw !== "object") return acc;
      const item = raw as Partial<NSKDateItem> & { type?: string };

      const legacyType = typeof item.type === "string" ? coerceTypeId(item.type) : null;
      const typeId =
        typeof item.type_id === "string" ? coerceTypeId(item.type_id) : legacyType;
      if (!typeId) return acc;
      if (typeof item.label !== "string" || item.label.trim().length === 0) return acc;
      if (typeof item.date !== "string" || item.date.trim().length === 0) return acc;

      const createdAt = typeof item.created_at === "string" ? item.created_at : new Date().toISOString();
      const updatedAt = typeof item.updated_at === "string" ? item.updated_at : createdAt;

      const normalized: NSKDateItem = {
        id:
          typeof item.id === "string" && item.id.trim().length > 0
            ? item.id
            : crypto.randomUUID(),
        label: item.label.trim(),
        type_id: typeId,
        date: item.date,
        is_recurring: Boolean(item.is_recurring),
        notes: typeof item.notes === "string" ? item.notes : undefined,
        created_at: createdAt,
        updated_at: updatedAt,
      };

      acc.push(normalized);
      return acc;
    }, []);
}

export function readNSKDatesStorage(): NSKDatesSchema {
  if (typeof window === "undefined") return createEmptyNSKDatesSchema();

  const raw = window.localStorage.getItem(NSKDATES_STORAGE_KEY);
  if (!raw) return createEmptyNSKDatesSchema();

  try {
    const parsed = JSON.parse(raw) as Partial<NSKDatesSchema> & { items?: unknown };

    const normalized: NSKDatesSchema = {
      version: NSKDATES_SCHEMA_VERSION,
      last_google_sync_at:
        typeof parsed.last_google_sync_at === "string" ? parsed.last_google_sync_at : null,
      items: normalizeItems(parsed.items),
    };
    return normalized;
  } catch {
    return createEmptyNSKDatesSchema();
  }
}

export function writeNSKDatesStorage(next: NSKDatesSchema) {
  if (typeof window === "undefined") return;

  const toPersist: NSKDatesSchema = {
    version: NSKDATES_SCHEMA_VERSION,
    last_google_sync_at: next.last_google_sync_at ?? null,
    items: normalizeItems(next.items),
  };
  window.localStorage.setItem(NSKDATES_STORAGE_KEY, JSON.stringify(toPersist));
}

"use client";

import { emitListAppDataUpdated } from "@/lib/storage/list-app-data-updated";
import { markPendingDriveSync } from "@/lib/storage/pending-drive-sync";
import { buildNskListAppStorageKey } from "@/lib/storage/session-storage-keys";
import {
  createEmptyNSKDatesSchema,
  isDateTypeId,
  NSKDATES_SCHEMA_VERSION,
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
        google_calendar_event_id:
          typeof item.google_calendar_event_id === "string" && item.google_calendar_event_id.trim().length > 0
            ? item.google_calendar_event_id
            : undefined,
        google_calendar_email_reminder_minutes:
          typeof item.google_calendar_email_reminder_minutes === "number" &&
          Number.isFinite(item.google_calendar_email_reminder_minutes)
            ? item.google_calendar_email_reminder_minutes
            : undefined,
        created_at: createdAt,
        updated_at: updatedAt,
      };

      acc.push(normalized);
      return acc;
    }, []);
}

export function readNSKDatesStorage(sessionSuffix: string): NSKDatesSchema {
  if (typeof window === "undefined") return createEmptyNSKDatesSchema();

  const key = buildNskListAppStorageKey("dates", sessionSuffix);
  const raw = window.localStorage.getItem(key);
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

export function writeNSKDatesStorage(
  sessionSuffix: string,
  next: NSKDatesSchema,
  opts?: { skipPendingDriveMark?: boolean }
) {
  if (typeof window === "undefined") return;

  const key = buildNskListAppStorageKey("dates", sessionSuffix);
  const toPersist: NSKDatesSchema = {
    version: NSKDATES_SCHEMA_VERSION,
    last_google_sync_at: next.last_google_sync_at ?? null,
    items: normalizeItems(next.items),
  };
  window.localStorage.setItem(key, JSON.stringify(toPersist));
  emitListAppDataUpdated(sessionSuffix);
  if (!opts?.skipPendingDriveMark) markPendingDriveSync(sessionSuffix);
}

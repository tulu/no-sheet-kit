"use client";

import { emitListAppDataUpdated } from "@/lib/storage/list-app-data-updated";
import { markPendingDriveSync } from "@/lib/storage/pending-drive-sync";
import { buildNskListAppStorageKey } from "@/lib/storage/session-storage-keys";
import { isValidTrackerDate, isValidTrackerTime } from "./tracker-helpers";
import {
  createEmptyNSKTrackerSchema,
  isTrackerOutcomeId,
  NSKTRACKER_SCHEMA_VERSION,
  type NSKTrackerEntry,
  type NSKTrackerSchema,
  type NSKTrackerTrack,
  type TrackerOutcomeId,
} from "./schema";

function normalizeTracks(raw: unknown): NSKTrackerTrack[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  const list = raw.reduce<NSKTrackerTrack[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const tr = row as Partial<NSKTrackerTrack>;
    if (typeof tr.name !== "string" || tr.name.trim().length === 0) return acc;
    const createdAt = typeof tr.created_at === "string" ? tr.created_at : now;
    const updatedAt = typeof tr.updated_at === "string" ? tr.updated_at : createdAt;
    acc.push({
      id: typeof tr.id === "string" && tr.id.trim() ? tr.id : crypto.randomUUID(),
      name: tr.name.trim(),
      order: typeof tr.order === "number" && Number.isFinite(tr.order) ? tr.order : acc.length,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
  list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  return list;
}

function normalizeEntries(raw: unknown, validTrackIds: Set<string>): NSKTrackerEntry[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  return raw.reduce<NSKTrackerEntry[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const e = row as Partial<NSKTrackerEntry>;
    if (typeof e.track_id !== "string" || !validTrackIds.has(e.track_id)) return acc;
    if (typeof e.occurred_on !== "string" || !isValidTrackerDate(e.occurred_on)) return acc;
    const startTime =
      typeof e.start_time === "string" && isValidTrackerTime(e.start_time)
        ? e.start_time
        : undefined;
    const endTime =
      typeof e.end_time === "string" && isValidTrackerTime(e.end_time) ? e.end_time : undefined;
    const createdAt = typeof e.created_at === "string" ? e.created_at : now;
    const updatedAt = typeof e.updated_at === "string" ? e.updated_at : createdAt;
    const outcomeId: TrackerOutcomeId =
      typeof e.outcome_id === "string" && isTrackerOutcomeId(e.outcome_id)
        ? e.outcome_id
        : "fulfilled";
    acc.push({
      id: typeof e.id === "string" && e.id.trim() ? e.id : crypto.randomUUID(),
      track_id: e.track_id,
      occurred_on: e.occurred_on,
      outcome_id: outcomeId,
      start_time: startTime,
      end_time: endTime,
      notes: typeof e.notes === "string" && e.notes.trim() ? e.notes.trim() : undefined,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
}

export function readNSKTrackerStorage(sessionSuffix: string): NSKTrackerSchema {
  if (typeof window === "undefined") return createEmptyNSKTrackerSchema();

  const key = buildNskListAppStorageKey("tracker", sessionSuffix);
  const raw = window.localStorage.getItem(key);
  if (!raw) return createEmptyNSKTrackerSchema();

  try {
    const parsed = JSON.parse(raw) as Partial<NSKTrackerSchema> & {
      tracks?: unknown;
      entries?: unknown;
    };
    const tracks = normalizeTracks(parsed.tracks);
    const validIds = new Set(tracks.map((t) => t.id));
    const entries = normalizeEntries(parsed.entries, validIds);

    return {
      version: NSKTRACKER_SCHEMA_VERSION,
      last_google_sync_at:
        typeof parsed.last_google_sync_at === "string" ? parsed.last_google_sync_at : null,
      tracks,
      entries,
    };
  } catch {
    return createEmptyNSKTrackerSchema();
  }
}

export function writeNSKTrackerStorage(
  sessionSuffix: string,
  next: NSKTrackerSchema,
  opts?: { skipPendingDriveMark?: boolean }
) {
  if (typeof window === "undefined") return;
  const key = buildNskListAppStorageKey("tracker", sessionSuffix);
  const validIds = new Set(next.tracks.map((t) => t.id));
  const tracks = normalizeTracks(next.tracks);
  const entries = normalizeEntries(next.entries, validIds);
  const payload: NSKTrackerSchema = {
    version: NSKTRACKER_SCHEMA_VERSION,
    last_google_sync_at: next.last_google_sync_at ?? null,
    tracks,
    entries,
  };
  window.localStorage.setItem(key, JSON.stringify(payload));
  emitListAppDataUpdated(sessionSuffix);
  if (!opts?.skipPendingDriveMark) markPendingDriveSync(sessionSuffix);
}

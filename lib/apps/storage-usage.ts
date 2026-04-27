"use client";

import { APP_ORDER, type AppId, getAppHref } from "@/lib/apps/catalog";
import { getAppDisplayName } from "@/components/apps/launcher-apps";
import { buildNskListAppStorageKey, type NskListAppSlug } from "@/lib/storage/session-storage-keys";
import { getSavedElementCountForApp } from "@/lib/apps/list-app-saved-counts";

export const MAX_LOCAL_STORAGE_PER_APP_BYTES = 5 * 1024 * 1024;

export type AppStorageUsage = {
  id: AppId;
  displayName: string;
  href: string | null;
  records: number;
  usedBytes: number;
  usedPercent: number;
};

function appIdToSlug(appId: AppId): NskListAppSlug {
  return appId;
}

function readLocalStorageBytesForApp(appId: AppId, sessionSuffix: string): number {
  if (typeof window === "undefined") return 0;
  const key = buildNskListAppStorageKey(appIdToSlug(appId), sessionSuffix);
  const raw = window.localStorage.getItem(key);
  if (!raw) return 0;
  return new TextEncoder().encode(raw).length;
}

export function getAppStorageUsage(sessionSuffix: string): AppStorageUsage[] {
  return APP_ORDER.map((id) => {
    const usedBytes = readLocalStorageBytesForApp(id, sessionSuffix);
    const usedPercent = Math.min(100, (usedBytes / MAX_LOCAL_STORAGE_PER_APP_BYTES) * 100);
    return {
      id,
      displayName: getAppDisplayName(id),
      href: getAppHref(id),
      records: getSavedElementCountForApp(id, sessionSuffix),
      usedBytes,
      usedPercent,
    };
  });
}

/**
 * Latest Google sync timestamp found in app schemas for this session suffix.
 * Returns `null` when there is no valid `last_google_sync_at`.
 */
export function getLastGoogleSyncAt(sessionSuffix: string): string | null {
  if (typeof window === "undefined") return null;
  let maxMs = -1;
  let maxIso: string | null = null;
  for (const appId of APP_ORDER) {
    const key = buildNskListAppStorageKey(appIdToSlug(appId), sessionSuffix);
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as { last_google_sync_at?: unknown };
      if (typeof parsed.last_google_sync_at !== "string" || !parsed.last_google_sync_at) continue;
      const ms = Date.parse(parsed.last_google_sync_at);
      if (!Number.isFinite(ms)) continue;
      if (ms > maxMs) {
        maxMs = ms;
        maxIso = parsed.last_google_sync_at;
      }
    } catch {
      // Ignore malformed app payloads.
    }
  }
  return maxIso;
}

export function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : mb >= 10 ? 1 : 2)} MB`;
}

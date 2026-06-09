/**
 * Anonymous-session localStorage keys (legacy names re-exported).
 * Dynamic keys use {@link buildNskListAppStorageKey} with {@link SESSION_SUFFIX_ANONYMOUS} or `Google_<sub>`.
 */
import {
  buildNskListAppStorageKey,
  SESSION_SUFFIX_ANONYMOUS,
} from "@/lib/storage/session-storage-keys";

export { SESSION_SUFFIX_ANONYMOUS } from "@/lib/storage/session-storage-keys";

export const NSKLOANS_STORAGE_KEY = buildNskListAppStorageKey("loans", SESSION_SUFFIX_ANONYMOUS);
export const NSKDATES_STORAGE_KEY = buildNskListAppStorageKey("dates", SESSION_SUFFIX_ANONYMOUS);
export const NSKLINKS_STORAGE_KEY = buildNskListAppStorageKey("links", SESSION_SUFFIX_ANONYMOUS);
export const NSKDOMAINS_STORAGE_KEY = buildNskListAppStorageKey("domains", SESSION_SUFFIX_ANONYMOUS);
export const NSKTASKS_STORAGE_KEY = buildNskListAppStorageKey("tasks", SESSION_SUFFIX_ANONYMOUS);
export const NSKCOLLECTIONS_STORAGE_KEY = buildNskListAppStorageKey("collections", SESSION_SUFFIX_ANONYMOUS);
export const NSKTRACKER_STORAGE_KEY = buildNskListAppStorageKey("tracker", SESSION_SUFFIX_ANONYMOUS);

export const ALL_ANONYMOUS_APP_STORAGE_KEYS = [
  NSKLOANS_STORAGE_KEY,
  NSKDATES_STORAGE_KEY,
  NSKLINKS_STORAGE_KEY,
  NSKDOMAINS_STORAGE_KEY,
  NSKTASKS_STORAGE_KEY,
  NSKCOLLECTIONS_STORAGE_KEY,
  NSKTRACKER_STORAGE_KEY,
] as const;

export function clearAllAnonymousAppLocalStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of ALL_ANONYMOUS_APP_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

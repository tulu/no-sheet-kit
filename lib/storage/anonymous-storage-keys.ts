/**
 * Anonymous-session localStorage keys: existing app prefix + `Anonym`.
 * Keep this list in sync with all NSK list apps.
 */
export const NSKLOANS_STORAGE_KEY = "nskloansAnonym" as const;
export const NSKDATES_STORAGE_KEY = "nskdatesAnonym" as const;
export const NSKLINKS_STORAGE_KEY = "nsklinksAnonym" as const;
export const NSKDOMAINS_STORAGE_KEY = "nskdomainsAnonym" as const;
export const NSKTASKS_STORAGE_KEY = "nsktasksAnonym" as const;
export const NSKCOLLECTIONS_STORAGE_KEY = "nskcollectionsAnonym" as const;

export const ALL_ANONYMOUS_APP_STORAGE_KEYS = [
  NSKLOANS_STORAGE_KEY,
  NSKDATES_STORAGE_KEY,
  NSKLINKS_STORAGE_KEY,
  NSKDOMAINS_STORAGE_KEY,
  NSKTASKS_STORAGE_KEY,
  NSKCOLLECTIONS_STORAGE_KEY,
] as const;

export function clearAllAnonymousAppLocalStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of ALL_ANONYMOUS_APP_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

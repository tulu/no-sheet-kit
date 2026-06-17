/** Suffix after app prefix, e.g. `Anonym` → `nskloansAnonym`, or `Google_<sub>` → `nskloansGoogle_123`. */
export const SESSION_SUFFIX_ANONYMOUS = "Anonym" as const;

export type NskListAppSlug =
  | "loans"
  | "dates"
  | "links"
  | "domains"
  | "tasks"
  | "collections"
  | "tracker"
  | "events";

export const NSK_LIST_APP_SLUGS: NskListAppSlug[] = [
  "loans",
  "dates",
  "links",
  "domains",
  "tasks",
  "collections",
  "tracker",
  "events",
];

const PREFIX: Record<NskListAppSlug, string> = {
  loans: "nskloans",
  dates: "nskdates",
  links: "nsklinks",
  domains: "nskdomains",
  tasks: "nsktasks",
  collections: "nskcollections",
  tracker: "nsktracker",
  events: "nskevents",
};

export const ZIP_FILENAME_BY_SLUG: Record<NskListAppSlug, string> = {
  loans: "loans.json",
  dates: "dates.json",
  links: "links.json",
  domains: "domains.json",
  tasks: "tasks.json",
  collections: "collections.json",
  tracker: "tracker.json",
  events: "events.json",
};

export const GUEST_BACKUP_FILENAME_TO_SLUG: Record<string, NskListAppSlug> = {
  "loans.json": "loans",
  "dates.json": "dates",
  "links.json": "links",
  "domains.json": "domains",
  "tasks.json": "tasks",
  "collections.json": "collections",
  "tracker.json": "tracker",
  "events.json": "events",
};

export function googleSessionSuffixFromSub(sub: string): string {
  return `Google_${sub.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

export function buildNskListAppStorageKey(slug: NskListAppSlug, sessionSuffix: string): string {
  return `${PREFIX[slug]}${sessionSuffix}`;
}

export function allListAppStorageKeysForSuffix(sessionSuffix: string): string[] {
  return NSK_LIST_APP_SLUGS.map((slug) => buildNskListAppStorageKey(slug, sessionSuffix));
}

export function clearAllListAppLocalStorageForSuffix(sessionSuffix: string): void {
  if (typeof window === "undefined") return;
  for (const key of allListAppStorageKeysForSuffix(sessionSuffix)) {
    window.localStorage.removeItem(key);
  }
}

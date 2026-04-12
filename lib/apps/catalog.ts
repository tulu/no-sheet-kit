/**
 * Single source of truth: which apps exist, order, availability, and launch path.
 * UI (landing, /apps, switcher) should not hardcode per-app ids — use `APP_ORDER`, `isAppAvailable`, `getAppHref`.
 */
export const APP_ORDER = ["loans", "dates", "links", "domains"] as const;
export type AppId = (typeof APP_ORDER)[number];

type AppCatalogEntry = {
  /** When true, the app is linked in launcher UIs. */
  available: boolean;
  /** Route when available (must match a route under app/ as you add pages). */
  path: string;
};

export const APP_CATALOG: Record<AppId, AppCatalogEntry> = {
  loans: { available: true, path: "/apps/loans" },
  dates: { available: true, path: "/apps/dates" },
  links: { available: false, path: "/apps/links" },
  domains: { available: true, path: "/apps/domains" },
};

export function isAppAvailable(id: AppId): boolean {
  return APP_CATALOG[id].available;
}

/** `null` when the app is not available yet. */
export function getAppHref(id: AppId): string | null {
  const entry = APP_CATALOG[id];
  return entry.available ? entry.path : null;
}

/** First available app whose `path` matches `pathname` (for shell title, etc.). */
export function resolveAvailableAppFromPath(pathname: string): AppId | null {
  for (const id of APP_ORDER) {
    const { available, path } = APP_CATALOG[id];
    if (!available) continue;
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return id;
    }
  }
  return null;
}

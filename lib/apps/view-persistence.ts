const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 365;

/** Single cookie: JSON object mapping app key → persisted view mode string. */
export const NSK_APP_VIEWS_COOKIE_NAME = "nsk_app_views";

export const APP_VIEW_PERSISTENCE_KEYS = [
  "dates",
  "domains",
  "loans",
  "links",
  "tasks",
  "collections",
  "tracker",
  "events",
  "events_tasks",
  "events_expenses",
] as const;
export type AppViewPersistenceKey = (typeof APP_VIEW_PERSISTENCE_KEYS)[number];

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

function readBundleObject(): Record<string, string> {
  const raw = getCookieValue(NSK_APP_VIEWS_COOKIE_NAME);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && v.length > 0) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeBundleObject(next: Record<string, string>, maxAgeSeconds: number = DEFAULT_MAX_AGE_SEC): void {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(JSON.stringify(next));
  document.cookie = `${NSK_APP_VIEWS_COOKIE_NAME}=${encoded}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

/**
 * Read persisted view mode for one app from the shared bundle cookie (`nsk_app_views`).
 */
export function readAppViewBundlePreference<T extends string>(
  appKey: AppViewPersistenceKey,
  validModes: readonly T[]
): T | null {
  const bundle = readBundleObject();
  let fromBundle = bundle[appKey];
  if (appKey === "collections" && fromBundle === "table") {
    fromBundle = "list";
  }
  if (typeof fromBundle === "string" && (validModes as readonly string[]).includes(fromBundle)) {
    return fromBundle as T;
  }
  return null;
}

/**
 * Persist one app’s view mode into the shared bundle cookie.
 */
export function persistAppViewBundle(
  appKey: AppViewPersistenceKey,
  mode: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SEC
): void {
  if (typeof document === "undefined") return;
  const bundle = readBundleObject();
  bundle[appKey] = mode;
  writeBundleObject(bundle, maxAgeSeconds);
}

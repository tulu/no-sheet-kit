const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export const DATES_VIEW_COOKIE_NAME = "nsk_dates_view";
export const DOMAINS_VIEW_COOKIE_NAME = "nsk_domains_view";
export const LOANS_VIEW_COOKIE_NAME = "nsk_loans_view";
export const LINKS_VIEW_COOKIE_NAME = "nsk_links_view";
export const TASKS_VIEW_COOKIE_NAME = "nsk_tasks_view";

/** Read a view-mode cookie if it matches one of `validModes`. */
export function readAppViewCookie<T extends string>(
  cookieName: string,
  validModes: readonly T[]
): T | null {
  if (typeof document === "undefined") return null;
  const cookiePart = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${cookieName}=`));
  const raw = cookiePart?.split("=")[1];
  const value = raw ? decodeURIComponent(raw) : null;
  if (!value || !(validModes as readonly string[]).includes(value)) return null;
  return value as T;
}

export function persistAppViewCookie(
  cookieName: string,
  mode: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SEC
): void {
  if (typeof document === "undefined") return;
  document.cookie = `${cookieName}=${encodeURIComponent(mode)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

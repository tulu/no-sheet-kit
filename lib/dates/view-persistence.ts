import type { DatesViewMode } from "./schema";

export const DATES_VIEW_COOKIE_NAME = "nsk_dates_view";
const DATES_VIEW_MAX_AGE = 60 * 60 * 24 * 365;

const VIEW_MODES: DatesViewMode[] = ["list", "grid", "calendar"];

function isDatesViewMode(value: string): value is DatesViewMode {
  return (VIEW_MODES as string[]).includes(value);
}

export function readDatesViewCookie(): DatesViewMode | null {
  if (typeof document === "undefined") return null;
  const cookiePart = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${DATES_VIEW_COOKIE_NAME}=`));
  const raw = cookiePart?.split("=")[1];
  const value = raw ? decodeURIComponent(raw) : null;
  if (!value || !isDatesViewMode(value)) return null;
  return value;
}

export function persistDatesViewCookie(mode: DatesViewMode): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DATES_VIEW_COOKIE_NAME}=${encodeURIComponent(mode)}; Max-Age=${DATES_VIEW_MAX_AGE}; Path=/; SameSite=Lax`;
}

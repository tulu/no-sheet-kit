import type { DomainsViewMode } from "./schema";

export const DOMAINS_VIEW_COOKIE_NAME = "nsk_domains_view";
const DOMAINS_VIEW_MAX_AGE = 60 * 60 * 24 * 365;

const VIEW_MODES: DomainsViewMode[] = ["list", "grid"];

function isDomainsViewMode(value: string): value is DomainsViewMode {
  return (VIEW_MODES as string[]).includes(value);
}

export function readDomainsViewCookie(): DomainsViewMode | null {
  if (typeof document === "undefined") return null;
  const cookiePart = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${DOMAINS_VIEW_COOKIE_NAME}=`));
  const raw = cookiePart?.split("=")[1];
  const value = raw ? decodeURIComponent(raw) : null;
  if (!value || !isDomainsViewMode(value)) return null;
  return value;
}

export function persistDomainsViewCookie(mode: DomainsViewMode): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DOMAINS_VIEW_COOKIE_NAME}=${encodeURIComponent(mode)}; Max-Age=${DOMAINS_VIEW_MAX_AGE}; Path=/; SameSite=Lax`;
}

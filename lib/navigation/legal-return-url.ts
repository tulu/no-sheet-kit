/** Query key for “return here” after reading Privacy / Terms (same pattern as login flows). */
export const LEGAL_RETURN_QUERY_KEY = "returnUrl";

const MAX_RETURN_LEN = 2048;

/**
 * Validates `returnUrl` from the query string: same-origin path + optional search/hash only.
 * Rejects open redirects (`//`, `https:`, etc.).
 */
export function getSafeReturnHref(raw: string | null | undefined): string {
  if (raw == null) return "/";
  let decoded = raw.trim();
  if (!decoded) return "/";
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return "/";
  }
  if (decoded.length > MAX_RETURN_LEN) return "/";
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/";
  if (decoded.includes("://") || decoded.includes("\\") || decoded.includes("@")) return "/";
  return decoded;
}

export function buildLegalHref(
  legalPath: "/privacy" | "/terms",
  pathname: string,
  searchParamsString: string,
): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const ret = searchParamsString ? `${path}?${searchParamsString}` : path;
  const q = new URLSearchParams();
  q.set(LEGAL_RETURN_QUERY_KEY, ret);
  return `${legalPath}?${q.toString()}`;
}

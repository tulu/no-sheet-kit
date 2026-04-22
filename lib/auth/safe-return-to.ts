const DEFAULT = "/apps";
const MAX_LEN = 2048;

/**
 * Allow only same-origin relative paths under `/apps` (no protocol, no `//`).
 */
export function safeReturnTo(value: string | null | undefined, fallback: string = DEFAULT): string {
  if (value == null || typeof value !== "string") return fallback;
  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }
  if (decoded.length === 0 || decoded.length > MAX_LEN) return fallback;
  if (!decoded.startsWith("/apps")) return fallback;
  if (decoded.startsWith("//") || decoded.includes("://")) return fallback;
  if (decoded.includes("\0")) return fallback;
  return decoded;
}

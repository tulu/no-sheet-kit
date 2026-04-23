const DEV_FALLBACK =
  "nsk-local-dev-only-secret-min-32-chars-do-not-use-in-prod";

/**
 * HS256 key material for session JWTs. Production must set `NSK_AUTH_SECRET` (≥32 chars).
 */
export function getJwtSecretKey(): Uint8Array {
  const raw = process.env.NSK_AUTH_SECRET?.trim();
  if (raw && raw.length >= 32) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(DEV_FALLBACK);
  }
  throw new Error("NSK_AUTH_SECRET must be set to at least 32 characters in production.");
}

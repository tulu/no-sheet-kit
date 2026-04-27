/** OAuth 2.0 scopes for Drive app data + constrained Calendar + profile. */
export const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/calendar.app.created",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
].join(" ");

export const NSK_GOOGLE_REFRESH_COOKIE = "nsk_google_refresh";
export const NSK_GOOGLE_OAUTH_STATE_COOKIE = "nsk_google_oauth_state";

export const DRIVE_BACKUP_FILENAME = "nosheetkit-backup.zip";

export function getGoogleOAuthClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!id) throw new Error("GOOGLE_CLIENT_ID is not set.");
  return id;
}

export function getGoogleOAuthClientSecret(): string {
  const s = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!s) throw new Error("GOOGLE_CLIENT_SECRET is not set.");
  return s;
}

export function googleRedirectUriFromRequest(request: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) {
    const base = env.replace(/\/$/, "");
    return `${base}/api/auth/google/callback`;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL must be set in production for Google OAuth.");
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000/api/auth/google/callback";
  return `${proto}://${host}/api/auth/google/callback`;
}

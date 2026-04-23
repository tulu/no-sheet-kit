export function googleCalendarIdStorageKey(sub: string): string {
  return `nsk_google_calendar_${sub.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

export function readGoogleCalendarIdLocal(sub: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(googleCalendarIdStorageKey(sub));
}

export function writeGoogleCalendarIdLocal(sub: string, calendarId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(googleCalendarIdStorageKey(sub), calendarId);
}

export function clearGoogleCalendarIdLocal(sub: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(googleCalendarIdStorageKey(sub));
}

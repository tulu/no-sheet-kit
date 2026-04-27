import type { NskCalendarEventInput } from "./google-calendar";

export async function nskCalendarGetNoSheetKitCalendarId(): Promise<string | null | undefined> {
  const res = await fetch("/api/google/calendar/setup", { cache: "no-store" });
  if (!res.ok) return undefined;
  const j = (await res.json()) as { calendarId?: string | null };
  if (typeof j.calendarId === "string" && j.calendarId.trim()) return j.calendarId;
  return null;
}

export async function nskCalendarCreateEvent(
  body: NskCalendarEventInput
): Promise<{ id: string } | null> {
  const res = await fetch("/api/google/calendar/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { id?: string };
  return typeof j.id === "string" ? { id: j.id } : null;
}

export async function nskCalendarPatchEvent(
  eventId: string,
  body: Partial<NskCalendarEventInput>
): Promise<boolean> {
  const url = new URL("/api/google/calendar/events", window.location.origin);
  url.searchParams.set("id", eventId);
  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export async function nskCalendarDeleteEvent(eventId: string): Promise<boolean> {
  const url = new URL("/api/google/calendar/events", window.location.origin);
  url.searchParams.set("id", eventId);
  const res = await fetch(url.toString(), { method: "DELETE" });
  return res.ok;
}

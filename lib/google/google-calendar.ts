const CAL_BASE = "https://www.googleapis.com/calendar/v3";
const NSK_CALENDAR_SUMMARY = "NoSheetKit";

async function findNoSheetKitCalendarId(accessToken: string): Promise<string | null> {
  const listUrl = `${CAL_BASE}/users/me/calendarList`;
  const listRes = await fetch(listUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!listRes.ok) return null;
  const listJson = (await listRes.json()) as { items?: { id?: string; summary?: string }[] };
  const items = listJson.items ?? [];
  const existing = items.find((i) => i.summary === NSK_CALENDAR_SUMMARY);
  return existing?.id ?? null;
}

export async function getNoSheetKitCalendarId(accessToken: string): Promise<string | null> {
  return findNoSheetKitCalendarId(accessToken);
}

export async function ensureNoSheetKitCalendarId(accessToken: string): Promise<string | null> {
  const existingId = await findNoSheetKitCalendarId(accessToken);
  if (existingId) return existingId;

  const createRes = await fetch(`${CAL_BASE}/calendars`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ summary: NSK_CALENDAR_SUMMARY }),
  });
  if (!createRes.ok) return null;
  const created = (await createRes.json()) as { id?: string };
  return typeof created.id === "string" ? created.id : null;
}

export async function deleteNoSheetKitCalendar(
  accessToken: string,
  explicitCalendarId?: string
): Promise<boolean> {
  const calendarId = explicitCalendarId ?? (await findNoSheetKitCalendarId(accessToken));
  if (!calendarId) return true;
  const res = await fetch(`${CAL_BASE}/calendars/${encodeURIComponent(calendarId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.ok || res.status === 404;
}

export type NskCalendarReminderOverride = {
  method: "email" | "popup";
  minutes: number;
};

export type NskCalendarEventInput = {
  summary: string;
  description?: string;
  start: { date?: string; dateTime?: string; timeZone?: string };
  end: { date?: string; dateTime?: string; timeZone?: string };
  reminders?: {
    useDefault: boolean;
    overrides?: NskCalendarReminderOverride[];
  };
  /** RFC5545 rules, e.g. `RRULE:FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=14` */
  recurrence?: string[];
};

export async function insertCalendarEvent(
  accessToken: string,
  calendarId: string,
  body: NskCalendarEventInput
): Promise<{ id: string } | null> {
  const url = `${CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { id?: string };
  return typeof j.id === "string" ? { id: j.id } : null;
}

export async function patchCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  body: Partial<NskCalendarEventInput>
): Promise<boolean> {
  const url = `${CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const url = `${CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.ok;
}

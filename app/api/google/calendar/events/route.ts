import { NextResponse } from "next/server";
import {
  deleteCalendarEvent,
  ensureNoSheetKitCalendarId,
  insertCalendarEvent,
  patchCalendarEvent,
  type NskCalendarEventInput,
} from "@/lib/google/google-calendar";
import { getGoogleAccessTokenForCookies } from "@/lib/google/google-access-token";

function validReminders(r: unknown): boolean {
  if (r === undefined) return true;
  if (typeof r !== "object" || r === null) return false;
  const o = r as Record<string, unknown>;
  if (typeof o.useDefault !== "boolean") return false;
  if (o.overrides !== undefined) {
    if (!Array.isArray(o.overrides)) return false;
    for (const x of o.overrides) {
      if (typeof x !== "object" || x === null) return false;
      const u = x as Record<string, unknown>;
      if (u.method !== "email" && u.method !== "popup") return false;
      if (typeof u.minutes !== "number" || !Number.isFinite(u.minutes)) return false;
    }
  }
  return true;
}

function validRecurrence(r: unknown): boolean {
  if (r === undefined) return true;
  if (!Array.isArray(r)) return false;
  return r.every((x) => typeof x === "string" && x.length > 0);
}

export async function POST(request: Request) {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const calendarId = await ensureNoSheetKitCalendarId(ctx.accessToken);
  if (!calendarId) return NextResponse.json({ error: "no_calendar" }, { status: 502 });

  let body: NskCalendarEventInput;
  try {
    body = (await request.json()) as NskCalendarEventInput;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body?.summary || typeof body.summary !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.start || typeof body.start !== "object" || !body.end || typeof body.end !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!validReminders(body.reminders)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!validRecurrence(body.recurrence)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const created = await insertCalendarEvent(ctx.accessToken, calendarId, body);
  if (!created) return NextResponse.json({ error: "create_failed" }, { status: 502 });
  return NextResponse.json({ ok: true as const, id: created.id, calendarId });
}

export async function PATCH(request: Request) {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const eventId = url.searchParams.get("id");
  if (!eventId) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const calendarId = await ensureNoSheetKitCalendarId(ctx.accessToken);
  if (!calendarId) return NextResponse.json({ error: "no_calendar" }, { status: 502 });

  let body: Partial<NskCalendarEventInput>;
  try {
    body = (await request.json()) as Partial<NskCalendarEventInput>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (body.reminders !== undefined && !validReminders(body.reminders)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (body.recurrence !== undefined && !validRecurrence(body.recurrence)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const ok = await patchCalendarEvent(ctx.accessToken, calendarId, eventId, body);
  if (!ok) return NextResponse.json({ error: "patch_failed" }, { status: 502 });
  return NextResponse.json({ ok: true as const });
}

export async function DELETE(request: Request) {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const eventId = url.searchParams.get("id");
  if (!eventId) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const calendarId = await ensureNoSheetKitCalendarId(ctx.accessToken);
  if (!calendarId) return NextResponse.json({ error: "no_calendar" }, { status: 502 });

  const ok = await deleteCalendarEvent(ctx.accessToken, calendarId, eventId);
  if (!ok) return NextResponse.json({ error: "delete_failed" }, { status: 502 });
  return NextResponse.json({ ok: true as const });
}

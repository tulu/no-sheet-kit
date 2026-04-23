import { NextResponse } from "next/server";
import {
  deleteCalendarEvent,
  ensureNoSheetKitCalendarId,
  insertCalendarEvent,
  patchCalendarEvent,
  type NskCalendarEventInput,
} from "@/lib/google/google-calendar";
import { getGoogleAccessTokenForCookies } from "@/lib/google/google-access-token";

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

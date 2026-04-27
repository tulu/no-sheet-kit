import { NextResponse } from "next/server";
import {
  deleteNoSheetKitCalendar,
  ensureNoSheetKitCalendarId,
  getNoSheetKitCalendarId,
} from "@/lib/google/google-calendar";
import { getGoogleAccessTokenForCookies } from "@/lib/google/google-access-token";

export async function GET() {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const calendarId = await getNoSheetKitCalendarId(ctx.accessToken);
  return NextResponse.json({ ok: true as const, calendarId });
}

export async function POST() {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const calendarId = await ensureNoSheetKitCalendarId(ctx.accessToken);
  if (!calendarId) return NextResponse.json({ error: "calendar_failed" }, { status: 502 });

  return NextResponse.json({ ok: true as const, calendarId });
}

export async function DELETE(request: Request) {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const calendarId = url.searchParams.get("calendarId") ?? undefined;
  const ok = await deleteNoSheetKitCalendar(ctx.accessToken, calendarId);
  if (!ok) return NextResponse.json({ error: "calendar_delete_failed" }, { status: 502 });
  return NextResponse.json({ ok: true as const });
}

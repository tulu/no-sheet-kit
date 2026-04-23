import { NextResponse } from "next/server";
import { ensureNoSheetKitCalendarId } from "@/lib/google/google-calendar";
import { getGoogleAccessTokenForCookies } from "@/lib/google/google-access-token";

export async function POST() {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const calendarId = await ensureNoSheetKitCalendarId(ctx.accessToken);
  if (!calendarId) return NextResponse.json({ error: "calendar_failed" }, { status: 502 });

  return NextResponse.json({ ok: true as const, calendarId });
}

import { NextResponse } from "next/server";
import { NSK_SESSION_COOKIE_NAME, signAnonymousSessionJwt } from "@/lib/auth/session-token";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export async function POST() {
  let token: string;
  try {
    token = await signAnonymousSessionJwt();
  } catch {
    return NextResponse.json({ error: "session_unavailable" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true as const });
  res.cookies.set(NSK_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  return res;
}

import { NextResponse } from "next/server";
import { NSK_GOOGLE_REFRESH_COOKIE } from "@/lib/auth/google-oauth";
import { NSK_SESSION_COOKIE_NAME } from "@/lib/auth/session-token";

const clear = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
});

export async function POST() {
  const res = NextResponse.json({ ok: true as const });
  res.cookies.set(NSK_SESSION_COOKIE_NAME, "", clear());
  res.cookies.set(NSK_GOOGLE_REFRESH_COOKIE, "", clear());
  return res;
}

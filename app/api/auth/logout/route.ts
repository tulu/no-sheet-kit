import { NextResponse } from "next/server";
import { NSK_SESSION_COOKIE_NAME } from "@/lib/auth/session-token";

export async function POST() {
  const res = NextResponse.json({ ok: true as const });
  res.cookies.set(NSK_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

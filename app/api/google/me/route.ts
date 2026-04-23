import { NextResponse } from "next/server";
import { getGoogleAccessTokenForCookies } from "@/lib/google/google-access-token";

export async function GET() {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${ctx.accessToken}` },
  });
  if (!res.ok) return NextResponse.json({ error: "userinfo_failed" }, { status: 502 });

  const u = (await res.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  return NextResponse.json({
    sub: ctx.sub,
    email: u.email ?? ctx.email,
    name: typeof u.name === "string" ? u.name : undefined,
    picture: typeof u.picture === "string" ? u.picture : undefined,
  });
}

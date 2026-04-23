import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NSK_SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/auth/session-token";

export async function GET() {
  const token = (await cookies()).get(NSK_SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionJwt(token);
  if (!session) return NextResponse.json({ kind: "none" as const });
  if (session.kind === "anonymous") return NextResponse.json({ kind: "anonymous" as const });
  return NextResponse.json({
    kind: "google" as const,
    sub: session.sub,
    email: session.email ?? null,
    name: session.name ?? null,
    picture: session.picture ?? null,
  });
}

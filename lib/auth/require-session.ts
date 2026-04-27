import { cookies } from "next/headers";
import { NSK_SESSION_COOKIE_NAME, verifySessionJwt, type VerifiedSession } from "@/lib/auth/session-token";

export async function getVerifiedSessionFromCookies(): Promise<VerifiedSession | null> {
  const jar = await cookies();
  const token = jar.get(NSK_SESSION_COOKIE_NAME)?.value;
  return verifySessionJwt(token);
}

/** Verified session plus raw cookie value (for per-session rate limits on anonymous JWTs). */
export async function getVerifiedSessionAndCookie(): Promise<
  { session: VerifiedSession; token: string } | null
> {
  const jar = await cookies();
  const token = jar.get(NSK_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionJwt(token);
  if (!session) return null;
  return { session, token };
}

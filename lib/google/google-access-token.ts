import { cookies } from "next/headers";
import {
  getGoogleOAuthClientId,
  getGoogleOAuthClientSecret,
  NSK_GOOGLE_REFRESH_COOKIE,
} from "@/lib/auth/google-oauth";
import { unsealGoogleRefreshToken } from "@/lib/auth/google-refresh-cookie";
import { NSK_SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/auth/session-token";

export type GoogleAuthedContext = {
  accessToken: string;
  sub: string;
  email?: string;
};

export async function getGoogleAccessTokenForCookies(): Promise<GoogleAuthedContext | null> {
  const jar = await cookies();
  const session = await verifySessionJwt(jar.get(NSK_SESSION_COOKIE_NAME)?.value);
  if (!session || session.kind !== "google") return null;

  const sealed = jar.get(NSK_GOOGLE_REFRESH_COOKIE)?.value;
  if (!sealed) return null;
  const refresh = await unsealGoogleRefreshToken(sealed);
  if (!refresh) return null;

  let clientId: string;
  let clientSecret: string;
  try {
    clientId = getGoogleOAuthClientId();
    clientSecret = getGoogleOAuthClientSecret();
  } catch {
    return null;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { access_token?: string };
  const accessToken = typeof j.access_token === "string" ? j.access_token : "";
  if (!accessToken) return null;

  return { accessToken, sub: session.sub, email: session.email };
}

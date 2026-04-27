import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getGoogleOAuthClientId,
  getGoogleOAuthClientSecret,
  googleRedirectUriFromRequest,
  NSK_GOOGLE_OAUTH_STATE_COOKIE,
  NSK_GOOGLE_REFRESH_COOKIE,
} from "@/lib/auth/google-oauth";
import { sealGoogleRefreshToken } from "@/lib/auth/google-refresh-cookie";
import { NSK_SESSION_COOKIE_NAME, signGoogleSessionJwt } from "@/lib/auth/session-token";
import { safeReturnTo } from "@/lib/auth/safe-return-to";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(NSK_GOOGLE_OAUTH_STATE_COOKIE)?.value;

  const failRedirect = (reason: string) => {
    const login = new URL("/login", url.origin);
    login.searchParams.set("google_error", reason);
    const res = NextResponse.redirect(login.toString());
    res.cookies.set(NSK_GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  };

  if (err) return failRedirect(err);
  if (!code || !state || !expectedState || state !== expectedState) {
    return failRedirect("invalid_state");
  }

  let returnTo = "/apps";
  const dot = state.indexOf(".");
  if (dot !== -1) {
    try {
      returnTo = safeReturnTo(Buffer.from(state.slice(dot + 1), "base64url").toString("utf8"));
    } catch {
      returnTo = "/apps";
    }
  }

  let clientId: string;
  let clientSecret: string;
  try {
    clientId = getGoogleOAuthClientId();
    clientSecret = getGoogleOAuthClientSecret();
  } catch {
    return failRedirect("not_configured");
  }

  let redirectUri: string;
  try {
    redirectUri = googleRedirectUriFromRequest(request);
  } catch {
    return failRedirect("app_url_not_configured");
  }
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return failRedirect("token_exchange");

  const tokens = (await tokenRes.json()) as TokenResponse;
  const refresh = typeof tokens.refresh_token === "string" ? tokens.refresh_token : "";
  if (!refresh) return failRedirect("no_refresh_token");

  const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userinfoRes.ok) return failRedirect("userinfo");

  const profile = (await userinfoRes.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  const sub = typeof profile.sub === "string" ? profile.sub : "";
  if (!sub) return failRedirect("no_sub");

  const email = typeof profile.email === "string" ? profile.email : undefined;
  const name = typeof profile.name === "string" ? profile.name : undefined;
  const picture = typeof profile.picture === "string" ? profile.picture : undefined;
  const sessionJwt = await signGoogleSessionJwt(sub, { email, name, picture });
  const sealedRefresh = await sealGoogleRefreshToken(refresh);

  const dest = new URL(returnTo, url.origin);
  dest.searchParams.set("drive_restore", "1");

  const res = NextResponse.redirect(dest.toString());
  res.cookies.set(NSK_GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(NSK_SESSION_COOKIE_NAME, sessionJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  res.cookies.set(NSK_GOOGLE_REFRESH_COOKIE, sealedRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  return res;
}

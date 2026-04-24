import { NextResponse } from "next/server";
import {
  getGoogleOAuthClientId,
  GOOGLE_OAUTH_SCOPES,
  googleRedirectUriFromRequest,
  NSK_GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/auth/google-oauth";
import { safeReturnTo } from "@/lib/auth/safe-return-to";

function randomPart(): string {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: Request) {
  let clientId: string;
  try {
    clientId = getGoogleOAuthClientId();
  } catch {
    return NextResponse.json({ error: "google_oauth_not_configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const nonce = randomPart();
  const state = `${nonce}.${Buffer.from(returnTo, "utf8").toString("base64url")}`;

  let redirectUri: string;
  try {
    redirectUri = googleRedirectUriFromRequest(request);
  } catch {
    return NextResponse.json({ error: "app_url_not_configured" }, { status: 503 });
  }

  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", GOOGLE_OAUTH_SCOPES);
  auth.searchParams.set("access_type", "offline");
  auth.searchParams.set("prompt", "consent");
  auth.searchParams.set("state", state);

  const res = NextResponse.redirect(auth.toString());
  res.cookies.set(NSK_GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}

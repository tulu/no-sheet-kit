import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeReturnTo } from "@/lib/auth/safe-return-to";
import { NSK_SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/auth/session-token";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(NSK_SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionJwt(token);
  if (session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  const rawReturn = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("returnTo", safeReturnTo(rawReturn));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/apps/:path*"],
};

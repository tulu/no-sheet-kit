import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginPageContent } from "@/components/login/login-page-content";
import { safeReturnTo } from "@/lib/auth/safe-return-to";
import { NSK_SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/auth/session-token";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("login", "/login");

type LoginPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const token = (await cookies()).get(NSK_SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionJwt(token);
  if (session) {
    redirect(safeReturnTo(params.returnTo));
  }

  return <LoginPageContent />;
}

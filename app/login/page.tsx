import type { Metadata } from "next";
import { LoginPageContent } from "@/components/login/login-page-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("login", "/login");

export default function LoginPage() {
  return <LoginPageContent />;
}

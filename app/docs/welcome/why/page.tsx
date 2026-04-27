import type { Metadata } from "next";
import { DocsWelcomeWhyContent } from "@/components/docs/docs-welcome-why-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("docsWelcomeWhy", "/docs/welcome/why");

export default function DocsWelcomeWhyPage() {
  return <DocsWelcomeWhyContent />;
}

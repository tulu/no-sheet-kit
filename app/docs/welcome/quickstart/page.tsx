import type { Metadata } from "next";
import { DocsWelcomeQuickstartContent } from "@/components/docs/docs-welcome-quickstart-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata(
  "docsWelcomeQuickstart",
  "/docs/welcome/quickstart"
);

export default function DocsWelcomeQuickstartPage() {
  return <DocsWelcomeQuickstartContent />;
}

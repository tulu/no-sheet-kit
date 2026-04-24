import type { Metadata } from "next";
import { DocsWelcomeFeaturesContent } from "@/components/docs/docs-welcome-features-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata(
  "docsWelcomeFeatures",
  "/docs/welcome/key-features"
);

export default function DocsWelcomeKeyFeaturesPage() {
  return <DocsWelcomeFeaturesContent />;
}

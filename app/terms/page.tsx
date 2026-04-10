import type { Metadata } from "next";
import { TermsPageContent } from "@/components/legal/terms-page-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("terms", "/terms");

export default function TermsPage() {
  return <TermsPageContent />;
}

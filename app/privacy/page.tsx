import type { Metadata } from "next";
import { PrivacyPageContent } from "@/components/legal/privacy-page-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("privacy", "/privacy");

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}

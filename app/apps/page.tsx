import type { Metadata } from "next";
import { AppsPageContent } from "@/components/apps/apps-page-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("apps", "/apps");

export default function AppsPage() {
  return <AppsPageContent />;
}

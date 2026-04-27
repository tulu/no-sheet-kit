import type { Metadata } from "next";
import { DocsDataDocContent } from "@/components/docs/docs-data-doc-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata(
  "docsDataGoogleCalendar",
  "/docs/data/google-calendar"
);

export default function DocsDataGoogleCalendarPage() {
  return <DocsDataDocContent pageKey="dataGoogleCalendar" />;
}

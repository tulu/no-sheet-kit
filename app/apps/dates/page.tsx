import type { Metadata } from "next";
import { DatesAppPage } from "@/components/apps/dates/dates-app-page";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("dates", "/apps/dates");

export default function DatesPage() {
  return <DatesAppPage />;
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackerAppPage } from "@/components/apps/tracker/tracker-app-page";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("tracker", "/apps/tracker");

export default function TrackerPage() {
  return (
    <Suspense fallback={null}>
      <TrackerAppPage />
    </Suspense>
  );
}

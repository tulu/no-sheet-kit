import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsAppPage } from "@/components/apps/events/events-app-page";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("events", "/apps/events");

export default function EventsPage() {
  return (
    <Suspense fallback={null}>
      <EventsAppPage />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { AppsSettingsPageContent } from "@/components/apps/apps-settings-page-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("settings", "/apps/settings");

export default function AppsSettingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-lg px-6 py-8 min-h-[12rem]" />}>
      <AppsSettingsPageContent />
    </Suspense>
  );
}

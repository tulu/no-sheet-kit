import type { Metadata } from "next";
import { Suspense } from "react";
import { AppsSettingsPageContent } from "@/components/apps/apps-settings-page-content";

export const metadata: Metadata = {
  title: "Settings — NoSheetKit",
};

export default function AppsSettingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-lg px-6 py-8 min-h-[12rem]" />}>
      <AppsSettingsPageContent />
    </Suspense>
  );
}

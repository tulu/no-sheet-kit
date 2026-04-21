import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionsAppPage } from "@/components/collections/collections-app-page";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("collections", "/apps/collections");

export default function CollectionsPage() {
  return (
    <Suspense fallback={null}>
      <CollectionsAppPage />
    </Suspense>
  );
}

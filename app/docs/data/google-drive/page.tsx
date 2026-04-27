import type { Metadata } from "next";
import { DocsDataDocContent } from "@/components/docs/docs-data-doc-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata(
  "docsDataGoogleDrive",
  "/docs/data/google-drive"
);

export default function DocsDataGoogleDrivePage() {
  return <DocsDataDocContent pageKey="dataDrive" />;
}

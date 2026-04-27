import type { Metadata } from "next";
import { DocsDataDocContent } from "@/components/docs/docs-data-doc-content";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata(
  "docsDataImportExport",
  "/docs/data/import-export"
);

export default function DocsDataImportExportPage() {
  return <DocsDataDocContent pageKey="dataImportExport" />;
}

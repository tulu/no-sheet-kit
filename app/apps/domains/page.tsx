import type { Metadata } from "next";
import { DomainsAppPage } from "@/components/domains/domains-app-page";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("domains", "/apps/domains");

export default function DomainsPage() {
  return <DomainsAppPage />;
}

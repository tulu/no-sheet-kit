import type { Metadata } from "next";
import { LinksAppPage } from "@/components/apps/links/links-app-page";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("links", "/apps/links");

export default function LinksPage() {
  return <LinksAppPage />;
}

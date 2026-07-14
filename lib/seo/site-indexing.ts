import type { Metadata } from "next";
import type { AppId } from "@/lib/apps/catalog";
import { getSolutionPathname } from "@/lib/seo/app-solutions";

/** Site-wide crawl policy: never index. Page titles/OG/copy still ship. */
export const siteRobotsWhenIndexingDisabled: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function getSiteRobotsMetadata(): Metadata["robots"] {
  return siteRobotsWhenIndexingDisabled;
}

/** No public sitemap while indexing is hard-disabled. */
export function getPublicSitemapPaths(): string[] {
  return [];
}

/** Marketing landing href for an app solution page. */
export function getSolutionHref(appId: AppId): string {
  return getSolutionPathname(appId);
}

/** JSON-LD is off while the site is not indexable. */
export function shouldRenderSeoJsonLd(): boolean {
  return false;
}

/** Solution marketing pages stay available to users. */
export function areSolutionPagesEnabled(): boolean {
  return true;
}

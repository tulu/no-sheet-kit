import type { Metadata } from "next";
import type { AppId } from "@/lib/apps/catalog";
import { getSolutionPathname } from "@/lib/seo/app-solutions";
import { PUBLIC_SITEMAP_PATHS } from "@/lib/seo/sitemap-paths";

/** When true, public marketing/docs/solutions are indexable (official deployment only). */
export function isSiteIndexingEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_SITE_INDEXING_ENABLED?.trim().toLowerCase();
  return raw === "true" || raw === "1";
}

export const siteRobotsWhenIndexingDisabled: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function getSiteRobotsMetadata(): Metadata["robots"] {
  return isSiteIndexingEnabled()
    ? { index: true, follow: true }
    : siteRobotsWhenIndexingDisabled;
}

/** Public URLs for sitemap.xml — empty when indexing is disabled. */
export function getPublicSitemapPaths(): string[] {
  return isSiteIndexingEnabled() ? PUBLIC_SITEMAP_PATHS : [];
}

/** Marketing landing href, or null when indexing disabled. */
export function getSolutionHref(appId: AppId): string | null {
  if (!isSiteIndexingEnabled()) return null;
  return getSolutionPathname(appId);
}

export function shouldRenderSeoJsonLd(): boolean {
  return isSiteIndexingEnabled();
}

/** Whether /solutions routes should be served (404 when false). */
export function areSolutionPagesEnabled(): boolean {
  return isSiteIndexingEnabled();
}

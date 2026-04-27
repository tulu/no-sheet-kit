import type { Metadata } from "next";
import { seoCopy } from "@/lib/seo/copy";
import { getMetadataBase, siteLogoPath, siteName } from "@/lib/seo/site";

type SeoKey = keyof typeof seoCopy;

function fullTitle(shortTitle: string) {
  return `${shortTitle} | ${siteName}`;
}

/** Absolute page URL for Open Graph (and similar), using the configured site origin. */
function absolutePageUrl(pathname: string): string {
  const origin = getMetadataBase().origin.replace(/\/$/, "");
  if (pathname === "/") return `${origin}/`;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}

/** Per-route SEO: short `title` uses root `title.template`; OG/Twitter get the full branded title. */
export function buildPageMetadata(key: SeoKey, pathname: string): Metadata {
  const { title, description } = seoCopy[key];
  const ogUrl = absolutePageUrl(pathname);
  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      type: "website",
      title: fullTitle(title),
      description,
      url: ogUrl,
      images: [{ url: siteLogoPath, alt: `${siteName} logo` }],
    },
    twitter: {
      card: "summary",
      title: fullTitle(title),
      description,
      images: [siteLogoPath],
    },
  };
}

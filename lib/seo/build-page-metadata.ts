import type { Metadata } from "next";
import { seoCopy } from "@/lib/seo/copy";
import { getSiteRobotsMetadata } from "@/lib/seo/site-indexing";
import { getMetadataBase, siteLogoPath, siteLogoPngPath, siteName } from "@/lib/seo/site";

type SeoKey = keyof typeof seoCopy;

export type RichPageMetadataInput = {
  title: string;
  description: string;
  pathname: string;
  keywords?: string[];
  ogImagePath?: string;
  ogImageAlt?: string;
};

function fullTitle(shortTitle: string) {
  return `${shortTitle} | ${siteName}`;
}

/** Absolute page URL for Open Graph (and similar), using the configured site origin. */
export function absolutePageUrl(pathname: string): string {
  const origin = getMetadataBase().origin.replace(/\/$/, "");
  if (pathname === "/") return `${origin}/`;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}

function absoluteAssetUrl(assetPath: string): string {
  const origin = getMetadataBase().origin.replace(/\/$/, "");
  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${origin}${path}`;
}

export function buildRichPageMetadata(input: RichPageMetadataInput): Metadata {
  const { title, description, pathname, keywords, ogImagePath, ogImageAlt } = input;
  const ogUrl = absolutePageUrl(pathname);
  const imagePath = ogImagePath ?? siteLogoPngPath;
  const imageUrl = absoluteAssetUrl(imagePath);
  const brandedTitle = fullTitle(title);

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: ogUrl,
    },
    robots: getSiteRobotsMetadata(),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title: brandedTitle,
      description,
      url: ogUrl,
      images: [
        {
          url: imageUrl,
          alt: ogImageAlt ?? `${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [imageUrl],
    },
  };
}

/** Per-route SEO from `seoCopy` keys. */
export function buildPageMetadata(key: SeoKey, pathname: string, ogImagePath?: string): Metadata {
  const { title, description } = seoCopy[key];
  return buildRichPageMetadata({
    title,
    description,
    pathname,
    ogImagePath,
  });
}

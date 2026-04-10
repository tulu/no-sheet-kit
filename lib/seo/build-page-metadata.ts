import type { Metadata } from "next";
import { seoCopy } from "@/lib/seo/copy";
import { siteName } from "@/lib/seo/site";

type SeoKey = keyof typeof seoCopy;

function fullTitle(shortTitle: string) {
  return `${shortTitle} | ${siteName}`;
}

/** Per-route SEO: short `title` uses root `title.template`; OG/Twitter get the full branded title. */
export function buildPageMetadata(key: SeoKey, pathname: string): Metadata {
  const { title, description } = seoCopy[key];
  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title: fullTitle(title),
      description,
      url: pathname,
    },
    twitter: {
      title: fullTitle(title),
      description,
    },
  };
}

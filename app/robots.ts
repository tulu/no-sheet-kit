import type { MetadataRoute } from "next";
import { isSiteIndexingEnabled } from "@/lib/seo/site-indexing";
import { getMetadataBase } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  if (!isSiteIndexingEnabled()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const base = getMetadataBase();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/apps/", "/apps", "/api/"],
      },
    ],
    sitemap: new URL("/sitemap.xml", base).href,
  };
}

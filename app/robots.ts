import type { MetadataRoute } from "next";
import { getMetadataBase } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
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

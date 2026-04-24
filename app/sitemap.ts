import type { MetadataRoute } from "next";
import { getMetadataBase } from "@/lib/seo/site";
import { PUBLIC_SITEMAP_PATHS } from "@/lib/seo/sitemap-paths";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[0]["changeFrequency"]>;

function entryFor(path: string): {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
} {
  if (path === "/") return { path, priority: 1, changeFrequency: "weekly" };
  if (path === "/login") return { path, priority: 0.9, changeFrequency: "monthly" };
  if (path === "/privacy" || path === "/terms") return { path, priority: 0.4, changeFrequency: "yearly" };
  if (path.startsWith("/docs/")) return { path, priority: 0.85, changeFrequency: "weekly" };
  return { path, priority: 0.5, changeFrequency: "monthly" };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getMetadataBase().origin.replace(/\/$/, "");
  return PUBLIC_SITEMAP_PATHS.map((path) => {
    const { priority, changeFrequency } = entryFor(path);
    const url = path === "/" ? `${origin}/` : `${origin}${path}`;
    return {
      url,
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });
}

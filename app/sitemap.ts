import type { MetadataRoute } from "next";
import { getMetadataBase } from "@/lib/seo/site";

const routes: Array<{
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[0]["changeFrequency"]>;
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/apps", priority: 0.9, changeFrequency: "weekly" },
  { path: "/apps/dates", priority: 0.85, changeFrequency: "weekly" },
  { path: "/apps/domains", priority: 0.85, changeFrequency: "weekly" },
  { path: "/apps/settings", priority: 0.7, changeFrequency: "monthly" },
  { path: "/login", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.5, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getMetadataBase().origin;
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? `${origin}/` : `${origin}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

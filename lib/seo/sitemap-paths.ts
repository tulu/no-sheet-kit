import { APP_ORDER } from "@/lib/apps/catalog";
import { getAllSolutionPathnames } from "@/lib/seo/app-solutions";

/**
 * Public URLs included in `sitemap.xml` when indexing is enabled.
 * Intentionally excludes `/apps` and API routes.
 */
export const PUBLIC_SITEMAP_PATHS: string[] = [
  "/",
  "/login",
  "/privacy",
  "/terms",
  "/docs/welcome/why",
  "/docs/welcome/key-features",
  "/docs/welcome/quickstart",
  ...APP_ORDER.map((appId) => `/docs/applications/${appId}`),
  "/docs/data/google-calendar",
  "/docs/data/import-export",
  "/docs/data/google-drive",
  ...getAllSolutionPathnames(),
];

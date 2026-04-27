import { APP_ORDER } from "@/lib/apps/catalog";

/**
 * Public URLs included in `sitemap.xml` (indexable marketing + docs + legal + login).
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
];

import type { AppId } from "@/lib/apps/catalog";
import { seoCopy } from "@/lib/seo/copy";

/** Keys in `seoCopy` for per-app documentation routes. */
export const DOC_APPLICATION_SEO_KEY: Record<AppId, keyof typeof seoCopy> = {
  collections: "docsApplicationCollections",
  dates: "docsApplicationDates",
  domains: "docsApplicationDomains",
  links: "docsApplicationLinks",
  loans: "docsApplicationLoans",
  tasks: "docsApplicationTasks",
  tracker: "docsApplicationTracker",
};

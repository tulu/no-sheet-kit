import { APP_ORDER, type AppId } from "@/lib/apps/catalog";

export type SolutionSeoKey =
  | "solutionDates"
  | "solutionDomains"
  | "solutionLoans"
  | "solutionLinks"
  | "solutionTasks"
  | "solutionCollections"
  | "solutionTracker"
  | "solutionEvents";

export type SolutionEntry = {
  appId: AppId;
  slug: string;
  seoKey: SolutionSeoKey;
};

export const SOLUTION_ENTRIES: SolutionEntry[] = [
  { appId: "dates", slug: "birthday-reminder", seoKey: "solutionDates" },
  { appId: "domains", slug: "domain-portfolio-manager", seoKey: "solutionDomains" },
  { appId: "loans", slug: "loan-tracker", seoKey: "solutionLoans" },
  { appId: "links", slug: "bookmark-manager", seoKey: "solutionLinks" },
  { appId: "tasks", slug: "task-tracker", seoKey: "solutionTasks" },
  { appId: "collections", slug: "collection-tracker", seoKey: "solutionCollections" },
  { appId: "tracker", slug: "activity-tracker", seoKey: "solutionTracker" },
  { appId: "events", slug: "event-planner", seoKey: "solutionEvents" },
];

const bySlug = new Map(SOLUTION_ENTRIES.map((e) => [e.slug, e]));
const byAppId = new Map(SOLUTION_ENTRIES.map((e) => [e.appId, e]));

export function getSolutionEntry(appId: AppId): SolutionEntry {
  const entry = byAppId.get(appId);
  if (!entry) throw new Error(`Unknown appId for solution: ${appId}`);
  return entry;
}

export function getSolutionEntryBySlug(slug: string): SolutionEntry | null {
  return bySlug.get(slug) ?? null;
}

export function isSolutionSlug(slug: string): AppId | null {
  const entry = bySlug.get(slug);
  return entry?.appId ?? null;
}

export function getSolutionPathname(appId: AppId): string {
  return `/solutions/${getSolutionEntry(appId).slug}`;
}

export function getSolutionScreenshotPath(appId: AppId): string {
  return `/docs/applications/${appId}.png`;
}

/** Apps without a real PNG yet — docs/solutions show the placeholder UI. */
const APP_IDS_WITHOUT_SCREENSHOT = new Set<AppId>([]);

export function hasApplicationScreenshot(appId: AppId): boolean {
  return !APP_IDS_WITHOUT_SCREENSHOT.has(appId);
}

/** All solution pathnames for sitemap (English slugs). */
export function getAllSolutionPathnames(): string[] {
  return SOLUTION_ENTRIES.map((e) => `/solutions/${e.slug}`);
}

export function getOtherSolutionEntries(appId: AppId): SolutionEntry[] {
  return SOLUTION_ENTRIES.filter((e) => e.appId !== appId);
}

export { APP_ORDER };

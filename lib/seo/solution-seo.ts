import type { Metadata } from "next";
import type { AppId } from "@/lib/apps/catalog";
import {
  getSolutionEntry,
  getSolutionScreenshotPath,
  type SolutionSeoKey,
} from "@/lib/seo/app-solutions";
import { buildRichPageMetadata } from "@/lib/seo/build-page-metadata";
import { seoCopy } from "@/lib/seo/copy";

const SOLUTION_KEYWORDS: Record<AppId, string[]> = {
  dates: ["birthday reminder", "anniversary tracker", "private calendar", "NoSheetKit"],
  domains: ["domain portfolio manager", "domain renewal tracker", "registrar", "NoSheetKit"],
  loans: ["loan tracker", "lend money", "borrow money tracker", "NoSheetKit"],
  links: ["bookmark manager", "link organizer", "save links", "NoSheetKit"],
  tasks: ["task tracker", "kanban board", "simple todo", "NoSheetKit"],
  collections: ["collection tracker", "inventory list", "lent borrowed", "NoSheetKit"],
  tracker: ["day log", "activity tracker", "daily log", "personal tracker", "NoSheetKit"],
  events: ["event planner", "guest list", "party planning", "wedding planner", "NoSheetKit"],
};

export function buildSolutionMetadata(appId: AppId): Metadata {
  const { slug, seoKey } = getSolutionEntry(appId);
  const key = seoKey as SolutionSeoKey;
  const { title, description } = seoCopy[key];
  const pathname = `/solutions/${slug}`;

  return buildRichPageMetadata({
    title,
    description,
    pathname,
    keywords: SOLUTION_KEYWORDS[appId],
    ogImagePath: getSolutionScreenshotPath(appId),
    ogImageAlt: `${title} — ${appId} screenshot`,
  });
}

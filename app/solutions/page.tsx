import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionsIndexPage } from "@/components/solutions/solutions-index-page";
import { buildRichPageMetadata } from "@/lib/seo/build-page-metadata";
import { seoCopy } from "@/lib/seo/copy";
import { areSolutionPagesEnabled } from "@/lib/seo/site-indexing";

export const dynamic = "force-dynamic";

const SOLUTIONS_INDEX_KEYWORDS = [
  "NoSheetKit",
  "birthday reminder",
  "loan tracker",
  "domain portfolio",
  "bookmark manager",
  "task tracker",
  "collection tracker",
  "activity tracker",
  "event planner",
  "browser mini-apps",
];

export async function generateMetadata(): Promise<Metadata> {
  if (!areSolutionPagesEnabled()) return {};
  return buildRichPageMetadata({
    title: seoCopy.solutionsIndex.title,
    description: seoCopy.solutionsIndex.description,
    pathname: "/solutions",
    keywords: SOLUTIONS_INDEX_KEYWORDS,
  });
}

export default function SolutionsIndexRoute() {
  if (!areSolutionPagesEnabled()) notFound();
  return <SolutionsIndexPage />;
}

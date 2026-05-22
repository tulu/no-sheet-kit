import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppSolutionPage } from "@/components/solutions/app-solution-page";
import { SolutionJsonLd } from "@/components/seo/solution-json-ld";
import {
  getSolutionEntryBySlug,
  SOLUTION_ENTRIES,
} from "@/lib/seo/app-solutions";
import {
  areSolutionPagesEnabled,
  shouldRenderSeoJsonLd,
} from "@/lib/seo/site-indexing";
import { buildSolutionMetadata } from "@/lib/seo/solution-seo";

type PageProps = { params: Promise<{ slug: string }> };

/** Respect locale cookie on each request (avoid baking English at build time). */
export const dynamic = "force-dynamic";

export function generateStaticParams(): { slug: string }[] {
  if (!areSolutionPagesEnabled()) return [];
  return SOLUTION_ENTRIES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getSolutionEntryBySlug(slug);
  if (!entry || !areSolutionPagesEnabled()) return {};
  return buildSolutionMetadata(entry.appId);
}

export default async function SolutionPage({ params }: PageProps) {
  if (!areSolutionPagesEnabled()) notFound();

  const { slug } = await params;
  const entry = getSolutionEntryBySlug(slug);
  if (!entry) notFound();

  return (
    <>
      {shouldRenderSeoJsonLd() ? <SolutionJsonLd appId={entry.appId} /> : null}
      <AppSolutionPage appId={entry.appId} />
    </>
  );
}

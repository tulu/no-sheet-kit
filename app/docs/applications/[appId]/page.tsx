import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsApplicationAppContent } from "@/components/docs/docs-application-app-content";
import { DocsApplicationJsonLd } from "@/components/seo/docs-application-json-ld";
import { APP_ORDER, type AppId } from "@/lib/apps/catalog";
import { DOC_APPLICATION_SEO_KEY } from "@/lib/docs/application-doc-seo";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import { getSolutionScreenshotPath } from "@/lib/seo/app-solutions";
import { shouldRenderSeoJsonLd } from "@/lib/seo/site-indexing";

export function generateStaticParams(): { appId: string }[] {
  return APP_ORDER.map((appId) => ({ appId }));
}

function parseAppId(raw: string): AppId | null {
  return APP_ORDER.includes(raw as AppId) ? (raw as AppId) : null;
}

type PageProps = { params: Promise<{ appId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { appId: raw } = await params;
  const appId = parseAppId(raw);
  if (!appId) return {};
  const key = DOC_APPLICATION_SEO_KEY[appId];
  return buildPageMetadata(key, `/docs/applications/${appId}`, getSolutionScreenshotPath(appId));
}

export default async function DocsApplicationPage({ params }: PageProps) {
  const { appId: raw } = await params;
  const appId = parseAppId(raw);
  if (!appId) notFound();
  return (
    <>
      {shouldRenderSeoJsonLd() ? <DocsApplicationJsonLd appId={appId} /> : null}
      <DocsApplicationAppContent appId={appId} />
    </>
  );
}

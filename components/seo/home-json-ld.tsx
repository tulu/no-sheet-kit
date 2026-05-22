import { getAllSolutionPathnames } from "@/lib/seo/app-solutions";
import { absolutePageUrl } from "@/lib/seo/build-page-metadata";
import { seoCopy } from "@/lib/seo/copy";
import { shouldRenderSeoJsonLd } from "@/lib/seo/site-indexing";
import { getMetadataBase, siteLogoPath, siteName } from "@/lib/seo/site";

export function HomeJsonLd() {
  const origin = getMetadataBase().origin.replace(/\/$/, "");
  const websiteId = `${origin}/#website`;
  const orgId = `${origin}/#organization`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteName,
      url: `${origin}/`,
      description: seoCopy.home.description,
      image: `${origin}${siteLogoPath}`,
      publisher: { "@id": orgId },
    },
    {
      "@type": "Organization",
      "@id": orgId,
      name: siteName,
      url: `${origin}/`,
    },
  ];

  if (shouldRenderSeoJsonLd()) {
    graph.push({
      "@type": "ItemList",
      name: `${siteName} solutions`,
      itemListElement: getAllSolutionPathnames().map((path, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absolutePageUrl(path),
      })),
    });
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      id="nsk-home-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

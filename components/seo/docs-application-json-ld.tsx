import type { AppId } from "@/lib/apps/catalog";
import { DOC_APPLICATION_SEO_KEY } from "@/lib/docs/application-doc-seo";
import { getSolutionScreenshotPath } from "@/lib/seo/app-solutions";
import { absolutePageUrl } from "@/lib/seo/build-page-metadata";
import { seoCopy } from "@/lib/seo/copy";
import { getMetadataBase, siteName } from "@/lib/seo/site";

type DocsApplicationJsonLdProps = {
  appId: AppId;
};

export function DocsApplicationJsonLd({ appId }: DocsApplicationJsonLdProps) {
  const key = DOC_APPLICATION_SEO_KEY[appId];
  const { title, description } = seoCopy[key];
  const pathname = `/docs/applications/${appId}`;
  const origin = getMetadataBase().origin.replace(/\/$/, "");
  const pageUrl = absolutePageUrl(pathname);
  const imageUrl = `${origin}${getSolutionScreenshotPath(appId)}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: title,
        description,
        url: pageUrl,
        image: imageUrl,
        publisher: {
          "@type": "Organization",
          name: siteName,
          url: `${origin}/`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteName,
            item: `${origin}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Documentation",
            item: `${origin}/docs/welcome/why`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      id={`nsk-docs-app-jsonld-${appId}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

import type { AppId } from "@/lib/apps/catalog";
import {
  getSolutionEntry,
  getSolutionScreenshotPath,
  type SolutionSeoKey,
} from "@/lib/seo/app-solutions";
import { absolutePageUrl } from "@/lib/seo/build-page-metadata";
import { seoCopy } from "@/lib/seo/copy";
import { getMetadataBase, siteName } from "@/lib/seo/site";

type SolutionJsonLdProps = {
  appId: AppId;
};

export function SolutionJsonLd({ appId }: SolutionJsonLdProps) {
  const { slug, seoKey } = getSolutionEntry(appId);
  const key = seoKey as SolutionSeoKey;
  const { title, description } = seoCopy[key];
  const pathname = `/solutions/${slug}`;
  const origin = getMetadataBase().origin.replace(/\/$/, "");
  const pageUrl = absolutePageUrl(pathname);
  const imageUrl = `${origin}${getSolutionScreenshotPath(appId)}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: title,
        description,
        url: pageUrl,
        image: imageUrl,
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        provider: {
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
            name: title,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      id={`nsk-solution-jsonld-${appId}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

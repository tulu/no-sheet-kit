import Script from "next/script";
import { seoCopy } from "@/lib/seo/copy";
import { getMetadataBase, siteLogoPath, siteName } from "@/lib/seo/site";

export function HomeJsonLd() {
  const origin = getMetadataBase().origin.replace(/\/$/, "");
  const websiteId = `${origin}/#website`;
  const orgId = `${origin}/#organization`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
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
    ],
  };

  return (
    <Script
      id="nsk-home-jsonld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { HomeJsonLd } from "@/components/seo/home-json-ld";
import { seoCopy } from "@/lib/seo/copy";
import { getMetadataBase, siteLogoPath, siteName } from "@/lib/seo/site";

const base = getMetadataBase();

export const metadata: Metadata = {
  title: {
    absolute: seoCopy.home.title,
  },
  description: seoCopy.home.description,
  keywords: [
    "NoSheetKit",
    "local-first",
    "privacy",
    "productivity",
    "browser",
    "mini-apps",
    "Google Drive backup",
    "Google Calendar",
    "documentation",
    "open source",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: base.href,
    siteName,
    title: seoCopy.home.title,
    description: seoCopy.home.description,
    images: [{ url: siteLogoPath, alt: `${siteName} logo` }],
  },
  twitter: {
    card: "summary",
    title: seoCopy.home.title,
    description: seoCopy.home.description,
    images: [siteLogoPath],
  },
};

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <LandingPage />
    </>
  );
}

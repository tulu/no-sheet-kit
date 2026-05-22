import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { HomeJsonLd } from "@/components/seo/home-json-ld";
import { buildRichPageMetadata } from "@/lib/seo/build-page-metadata";
import { seoCopy } from "@/lib/seo/copy";
import { shouldRenderSeoJsonLd } from "@/lib/seo/site-indexing";
import { siteLogoPngPath } from "@/lib/seo/site";

const homeKeywords = [
  "NoSheetKit",
  "local-first",
  "privacy",
  "birthday reminder",
  "loan tracker",
  "domain portfolio manager",
  "bookmark manager",
  "task tracker",
  "collection tracker",
  "browser mini-apps",
  "Google Drive backup",
  "Google Calendar",
  "open source",
];

const richHome = buildRichPageMetadata({
  title: seoCopy.home.title.replace(/^NoSheetKit — /, ""),
  description: seoCopy.home.description,
  pathname: "/",
  keywords: homeKeywords,
  ogImagePath: siteLogoPngPath,
  ogImageAlt: "NoSheetKit",
});

export const metadata: Metadata = {
  ...richHome,
  title: {
    absolute: seoCopy.home.title,
  },
};

export default function Home() {
  return (
    <>
      {shouldRenderSeoJsonLd() ? <HomeJsonLd /> : null}
      <LandingPage />
    </>
  );
}

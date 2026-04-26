import type { Metadata } from "next";
import { LoansAppPage } from "@/components/apps/loans/loans-app-page";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("loans", "/apps/loans");

export default function LoansPage() {
  return <LoansAppPage />;
}

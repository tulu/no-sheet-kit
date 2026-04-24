"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useLegalPageHref } from "@/components/legal/use-legal-page-href";
import { useI18n } from "@/components/providers/i18n-provider";

function LandingLegalLinks() {
  const { t } = useI18n();
  const privacyHref = useLegalPageHref("/privacy");
  const termsHref = useLegalPageHref("/terms");

  return (
    <>
      <a
        href={privacyHref}
        className="text-sm text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground"
      >
        {t.common.privacy}
      </a>
      <a
        href={termsHref}
        className="text-sm text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground"
      >
        {t.common.terms}
      </a>
    </>
  );
}

export function LandingFooter() {
  const { t } = useI18n();

  return (
    <footer className="flex items-center justify-between border-t border-border px-12 py-8 max-md:flex-col max-md:gap-4 max-md:text-center max-sm:px-5">
      <p className="text-sm text-muted-foreground">{t.landing.footer.copyright}</p>
      <div className="flex gap-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground"
        >
          {t.common.home}
        </Link>
        <Link
          href="/docs"
          className="text-sm text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground"
        >
          {t.docs.navTitle}
        </Link>
        <a
          href="https://github.com/tulu/no-sheet-kit"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground"
        >
          {t.common.github}
        </a>
        <Suspense
          fallback={
            <>
              <a
                href="/privacy"
                className="text-sm text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground"
              >
                {t.common.privacy}
              </a>
              <a
                href="/terms"
                className="text-sm text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground"
              >
                {t.common.terms}
              </a>
            </>
          }
        >
          <LandingLegalLinks />
        </Suspense>
      </div>
    </footer>
  );
}

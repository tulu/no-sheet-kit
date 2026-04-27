"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { useI18n } from "@/components/providers/i18n-provider";
import type { LegalDocument as LegalDocumentData } from "@/content/legal/types";
import {
  getSafeReturnHref,
  LEGAL_RETURN_QUERY_KEY,
} from "@/lib/navigation/legal-return-url";

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  document: LegalDocumentData;
};

function LegalDocumentBody({
  title,
  lastUpdated,
  document,
  backHref,
}: LegalDocumentProps & { backHref: string }) {
  const { t } = useI18n();

  return (
    <main className="mx-auto max-w-[720px] px-6 pt-6 pb-16">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-block text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t.common.back}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <h1 className="font-display mb-4 text-4xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mb-12 text-sm text-muted-foreground">{lastUpdated}</p>

      <div className="space-y-8 text-foreground">
        {document.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-3 leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-3 list-inside list-disc space-y-1 text-muted-foreground">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
            {section.externalLink && (
              <p className="mt-3 leading-relaxed text-muted-foreground">
                <a
                  href={section.externalLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4 transition-colors hover:text-[#519186]"
                >
                  {section.externalLink.label}
                </a>
                {section.externalLink.trailingText ? ` ${section.externalLink.trailingText}` : ""}
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

function LegalDocumentWithReturnUrl(props: LegalDocumentProps) {
  const searchParams = useSearchParams();
  const backHref = getSafeReturnHref(searchParams.get(LEGAL_RETURN_QUERY_KEY));
  return <LegalDocumentBody {...props} backHref={backHref} />;
}

export function LegalDocument(props: LegalDocumentProps) {
  return (
    <Suspense fallback={<LegalDocumentBody {...props} backHref="/" />}>
      <LegalDocumentWithReturnUrl {...props} />
    </Suspense>
  );
}

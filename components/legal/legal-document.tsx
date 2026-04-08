"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import type { LegalDocument as LegalDocumentData } from "@/content/legal/types";

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  document: LegalDocumentData;
};

export function LegalDocument({ title, lastUpdated, document }: LegalDocumentProps) {
  const { t } = useI18n();

  return (
    <main className="max-w-[720px] mx-auto px-6 pt-6 pb-16">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
        >
          {t.common.backToNoSheetKit}
        </Link>
        <LanguageSwitcher />
      </div>

      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-4">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground mb-12">{lastUpdated}</p>

      <div className="space-y-8 text-foreground">
        {document.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-muted-foreground leading-relaxed mb-3">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-3 space-y-1 text-muted-foreground list-disc list-inside">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
            {section.externalLink && (
              <p className="text-muted-foreground leading-relaxed mt-3">
                <a
                  href={section.externalLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4 hover:text-[#519186] transition-colors"
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

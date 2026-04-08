"use client";

import { termsByLocale } from "@/content/legal";
import { LegalDocument } from "./legal-document";
import { useI18n } from "@/components/providers/i18n-provider";

export function TermsPageContent() {
  const { locale, t } = useI18n();

  return (
    <LegalDocument
      title={t.legal.terms.title}
      lastUpdated={t.legal.terms.lastUpdated}
      document={termsByLocale[locale]}
    />
  );
}

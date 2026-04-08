"use client";

import { privacyByLocale } from "@/content/legal";
import { LegalDocument } from "./legal-document";
import { useI18n } from "@/components/providers/i18n-provider";

export function PrivacyPageContent() {
  const { locale, t } = useI18n();

  return (
    <LegalDocument
      title={t.legal.privacy.title}
      lastUpdated={t.legal.privacy.lastUpdated}
      document={privacyByLocale[locale]}
    />
  );
}

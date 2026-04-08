import type { Locale } from "@/lib/i18n/types";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  externalLink?: {
    href: string;
    label: string;
    trailingText?: string;
  };
};

export type LegalDocument = {
  locale: Locale;
  sections: LegalSection[];
};

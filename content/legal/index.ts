import type { Locale } from "@/lib/i18n/types";
import { privacyEn } from "./privacy.en";
import { privacyEs } from "./privacy.es";
import { privacyPt } from "./privacy.pt";
import { termsEn } from "./terms.en";
import { termsEs } from "./terms.es";
import { termsPt } from "./terms.pt";
import type { LegalDocument } from "./types";

export const privacyByLocale: Record<Locale, LegalDocument> = {
  en: privacyEn,
  es: privacyEs,
  pt: privacyPt,
};

export const termsByLocale: Record<Locale, LegalDocument> = {
  en: termsEn,
  es: termsEs,
  pt: termsPt,
};

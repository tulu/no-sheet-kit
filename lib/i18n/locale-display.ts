import { enUS, es, ptBR } from "react-day-picker/locale";
import type { Locale } from "./types";

/** BCP 47 tags for `Intl` and `toLocaleDateString`. */
export const INTL_LOCALE_TAG: Record<Locale, string> = {
  en: "en-US",
  es: "es",
  pt: "pt-BR",
};

/** First day of week for month grids: 0 = Sunday, 1 = Monday. */
export const CALENDAR_WEEK_START: Record<Locale, 0 | 1> = {
  en: 0,
  es: 1,
  pt: 1,
};

export const DAY_PICKER_LOCALE: Record<Locale, typeof enUS> = {
  en: enUS,
  es,
  pt: ptBR,
};

export function getIntlLocaleTag(locale: Locale): string {
  return INTL_LOCALE_TAG[locale];
}

export function getCalendarWeekStartsOn(locale: Locale): 0 | 1 {
  return CALENDAR_WEEK_START[locale];
}

export function getDayPickerLocale(locale: Locale) {
  return DAY_PICKER_LOCALE[locale];
}

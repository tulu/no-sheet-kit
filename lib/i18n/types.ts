export const LOCALES = ["en", "es", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "nsk_locale";

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function normalizeLocale(input: string | null | undefined): Locale | null {
  if (!input) return null;
  const base = input.toLowerCase().split("-")[0];
  return isLocale(base) ? base : null;
}

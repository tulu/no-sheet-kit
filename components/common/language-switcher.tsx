"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { LOCALES, type Locale } from "@/lib/i18n/types";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <>
      <label className="sr-only" htmlFor="language-switcher">
        {t.common.localeLabel}
      </label>
      <select
        id="language-switcher"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="h-9 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground"
        aria-label={t.common.localeLabel}
      >
        {LOCALES.map((entry) => (
          <option key={entry} value={entry}>
            {t.common.localeShort[entry]}
          </option>
        ))}
      </select>
    </>
  );
}

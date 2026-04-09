"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { LOCALES, LOCALE_NATIVE_NAMES, type Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  /** Show each language as its full endonym (e.g. English, Español) instead of EN/ES. */
  nativeNames?: boolean;
};

export function LanguageSwitcher({ nativeNames = false }: LanguageSwitcherProps) {
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
        className={cn(
          "h-9 rounded-md border border-border bg-background px-2.5 font-medium text-foreground",
          nativeNames ? "w-full max-w-xs text-sm" : "w-auto text-xs"
        )}
        aria-label={t.common.localeLabel}
      >
        {LOCALES.map((entry) => (
          <option key={entry} value={entry}>
            {nativeNames ? LOCALE_NATIVE_NAMES[entry] : t.common.localeShort[entry]}
          </option>
        ))}
      </select>
    </>
  );
}

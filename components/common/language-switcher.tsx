"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className="inline-flex items-center rounded-md border border-border bg-background p-0.5"
      aria-label={t.common.localeLabel}
    >
      {LOCALES.map((entry) => {
        const active = entry === locale;
        return (
          <button
            key={entry}
            type="button"
            onClick={() => setLocale(entry as Locale)}
            className={cn(
              "h-6 min-w-8 rounded-sm px-2 text-[11px] font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={active}
          >
            {t.common.localeShort[entry]}
          </button>
        );
      })}
    </div>
  );
}

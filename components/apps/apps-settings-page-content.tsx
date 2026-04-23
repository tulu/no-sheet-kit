"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { useI18n } from "@/components/providers/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { safeSettingsReturnTo } from "@/lib/apps/settings-return";
import { cn } from "@/lib/utils";
import { AppsSettingsGoogleCalendar } from "@/components/apps/apps-settings-google-calendar";

export function AppsSettingsPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const backHref = safeSettingsReturnTo(searchParams.get("returnTo"));

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-8">
      <Link
        href={backHref}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 mb-6 inline-flex")}
      >
        {t.apps.settings.back}
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground mb-2">
        {t.apps.settings.title}
      </h1>
      <p className="text-muted-foreground mb-8">{t.apps.settings.description}</p>

      <div className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{t.apps.settings.language}</p>
          <LanguageSwitcher nativeNames />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{t.apps.settings.theme}</p>
          <ThemeToggle />
        </div>
      </div>

      <AppsSettingsGoogleCalendar />
    </div>
  );
}

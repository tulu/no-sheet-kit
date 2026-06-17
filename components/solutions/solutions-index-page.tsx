"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/components/providers/i18n-provider";
import { APP_DISPLAY_ICONS, getAppDisplayName } from "@/lib/apps/app-display";
import { SOLUTION_ENTRIES } from "@/lib/seo/app-solutions";

const ACCENT = "#519186";

export function SolutionsIndexPage() {
  const { t } = useI18n();

  return (
    <article className="mx-auto max-w-[1100px] px-6 pb-16 pt-28 max-sm:px-5 max-sm:pt-24">
      <header className="mb-12 space-y-4">
        <h1 className="font-display text-[clamp(36px,5vw,52px)] leading-[1.1] tracking-[-0.025em] text-foreground">
          {t.solutions.index.h1}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t.solutions.index.subtitle}</p>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          {t.solutions.index.intro}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        {SOLUTION_ENTRIES.map((entry) => {
          const page = t.solutions.pages[entry.appId];
          const Icon = APP_DISPLAY_ICONS[entry.appId];
          const displayName = getAppDisplayName(entry.appId);

          return (
            <Link
              key={entry.appId}
              href={`/solutions/${entry.slug}`}
              className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={page.learnMore}
            >
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3.5 text-lg">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted"
                      aria-hidden
                    >
                      <Icon className="size-6" style={{ color: ACCENT }} />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">{displayName}</span>
                      <span>{page.h1}</span>
                    </span>
                  </CardTitle>
                  <CardDescription>{page.subtitle}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </article>
  );
}

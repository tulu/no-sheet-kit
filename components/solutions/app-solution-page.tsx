"use client";

import Link from "next/link";
import type { AppId } from "@/lib/apps/catalog";
import { getAppHref } from "@/lib/apps/catalog";
import { getAppDisplayName } from "@/lib/apps/app-display";
import { useI18n } from "@/components/providers/i18n-provider";
import { SolutionScreenshot } from "@/components/solutions/solution-screenshot";
import { buttonVariants } from "@/components/ui/button";
import { getOtherSolutionEntries } from "@/lib/seo/app-solutions";
import { getSolutionHref } from "@/lib/seo/site-indexing";
import { cn } from "@/lib/utils";

const ACCENT = "#519186";

type AppSolutionPageProps = {
  appId: AppId;
};

export function AppSolutionPage({ appId }: AppSolutionPageProps) {
  const { t } = useI18n();
  const page = t.solutions.pages[appId];
  const appHref = getAppHref(appId);
  const displayName = getAppDisplayName(appId);
  const related = getOtherSolutionEntries(appId);

  return (
    <article className="mx-auto max-w-[1100px] px-6 pb-16 pt-28 max-sm:px-5 max-sm:pt-24">
      <header className="mb-10 space-y-4">
        <Link
          href="/solutions"
          className="inline-block text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t.solutions.nav.allSolutions}
        </Link>
        <p className="text-sm font-medium text-muted-foreground">{displayName}</p>
        <h1 className="font-display text-[clamp(36px,5vw,52px)] leading-[1.1] tracking-[-0.025em] text-foreground">
          {page.h1}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{page.subtitle}</p>
      </header>

      <div className="mx-auto mb-10 max-w-3xl">
        <SolutionScreenshot
          appId={appId}
          placeholderTitle={t.solutions.imagePlaceholderTitle}
          placeholderHint={t.solutions.imagePlaceholderHint}
        />
      </div>

      <div className="space-y-10 text-muted-foreground">
        <p className="max-w-3xl text-base leading-relaxed">{page.intent}</p>

        <section>
          <ul className="flex max-w-3xl flex-col gap-3">
            {page.benefits.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                <span
                  className="mt-2 h-[5px] w-[5px] shrink-0 rounded-full"
                  style={{ background: ACCENT }}
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="max-w-3xl rounded-xl border border-border bg-muted/20 p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{page.vsAlternatives.title}</h2>
          <ul className="flex flex-col gap-2">
            {page.vsAlternatives.items.map((item) => (
              <li key={item} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          {appHref ? (
            <Link href={appHref} className={buttonVariants({ size: "lg" })}>
              {page.ctaOpen}
            </Link>
          ) : null}
          <Link
            href={`/docs/applications/${appId}`}
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            {page.ctaDocs}
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: "lg", variant: "ghost" })}
          >
            {page.ctaLogin}
          </Link>
        </div>

        <section className="max-w-3xl border-t border-border pt-10">
          <h2 className="mb-4 font-display text-2xl text-foreground">{page.relatedTitle}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {related.map((entry) => {
              const href = getSolutionHref(entry.appId) ?? getAppHref(entry.appId);
              const label = t.solutions.pages[entry.appId].h1;
              if (!href) {
                return (
                  <li key={entry.appId} className="text-sm text-muted-foreground">
                    {label}
                  </li>
                );
              }
              return (
                <li key={entry.appId}>
                  <Link
                    href={href}
                    className={cn(
                      "text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </article>
  );
}

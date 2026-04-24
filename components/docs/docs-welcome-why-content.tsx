"use client";

import { useI18n } from "@/components/providers/i18n-provider";

export function DocsWelcomeWhyContent() {
  const { t } = useI18n();
  const p = t.docs.pages.welcomeWhy;
  const w = t.landing.why;

  return (
    <article className="mx-auto max-w-3xl space-y-8 text-muted-foreground">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{p.title}</h1>
        <p>{p.intro}</p>
        <h2 className="font-display text-2xl font-normal italic text-foreground sm:text-3xl">
          {w.titleStart} <span className="not-italic text-primary">{w.titleEmphasis}</span> {w.titleEnd}
        </h2>
      </header>
      <ul className="space-y-6">
        {w.items.map((item) => (
          <li key={item.title} className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

"use client";

import { useI18n } from "@/components/providers/i18n-provider";

export function DocsWelcomeFeaturesContent() {
  const { t } = useI18n();
  const p = t.docs.pages.welcomeFeatures;

  return (
    <article className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{p.title}</h1>
      <p>{p.intro}</p>
      <ul className="list-disc space-y-3 pl-5">
        {p.bullets.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </article>
  );
}

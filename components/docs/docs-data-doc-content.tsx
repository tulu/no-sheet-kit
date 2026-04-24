"use client";

import { useI18n } from "@/components/providers/i18n-provider";

export type DocsDataPageKey = "dataGoogleCalendar" | "dataImportExport" | "dataDrive";

export function DocsDataDocContent({ pageKey }: { pageKey: DocsDataPageKey }) {
  const { t } = useI18n();
  const p = t.docs.pages[pageKey];

  return (
    <article className="mx-auto max-w-3xl space-y-8 text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{p.title}</h1>
      {p.sections.map((s) => (
        <section key={s.heading} className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{s.heading}</h2>
          <p>{s.body}</p>
        </section>
      ))}
    </article>
  );
}

"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";
import { buttonVariants } from "@/components/ui/button";

export function DocsWelcomeQuickstartContent() {
  const { t } = useI18n();
  const p = t.docs.pages.welcomeQuickstart;

  return (
    <article className="mx-auto max-w-3xl space-y-8 text-muted-foreground">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{p.title}</h1>
        <p>{p.intro}</p>
      </header>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">{p.guestTitle}</h2>
        <p>{p.guestBody}</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">{p.googleTitle}</h2>
        <p>{p.googleBody}</p>
      </section>
      <p>
        <Link href="/login" className={buttonVariants({ size: "sm" })}>
          {p.cta}
        </Link>
      </p>
    </article>
  );
}

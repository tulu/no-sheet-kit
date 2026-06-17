"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { AppId } from "@/lib/apps/catalog";
import { getAppHref } from "@/lib/apps/catalog";
import { useI18n } from "@/components/providers/i18n-provider";
import { getSolutionHref } from "@/lib/seo/site-indexing";
import { hasApplicationScreenshot } from "@/lib/seo/app-solutions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCREENSHOT_PUBLIC_PATH = "/docs/applications";

export function DocsApplicationAppContent({ appId }: { appId: AppId }) {
  const { t } = useI18n();
  const page = t.docs.pages.applications[appId];
  const href = getAppHref(appId);
  const solutionHref = getSolutionHref(appId);
  const learnMore = t.solutions.pages[appId].learnMore;
  const [imageFailed, setImageFailed] = useState(() => !hasApplicationScreenshot(appId));
  const src = `${SCREENSHOT_PUBLIC_PATH}/${appId}.png`;

  return (
    <article className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{page.title}</h1>
      </header>

      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-muted/20",
          imageFailed ? "border-dashed" : null
        )}
      >
        {!imageFailed ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={src}
              alt=""
              fill
              className="origin-top-left scale-[1.5] -translate-y-[9%] object-cover object-left-top"
              onError={() => setImageFailed(true)}
              unoptimized
              sizes="(max-width: 768px) 100vw, 42rem"
            />
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium text-foreground">{t.docs.applications.imagePlaceholderTitle}</p>
            <p className="max-w-md text-xs text-muted-foreground">
              {t.docs.applications.imagePlaceholderHint.replaceAll("{id}", appId)}
            </p>
          </div>
        )}
      </div>

      <p>{page.body}</p>

      <div className="flex flex-wrap gap-3">
        {solutionHref ? (
          <Link href={solutionHref} className={buttonVariants({ size: "default", variant: "outline" })}>
            {learnMore}
          </Link>
        ) : null}
        {href ? (
          <Link href={href} className={buttonVariants({ size: "default" })}>
            {page.cta}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

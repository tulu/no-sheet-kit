"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { getLauncherApps } from "@/components/apps/launcher-apps";

const ACCENT = "#519186";

export function AppsPageContent() {
  const { t } = useI18n();
  const apps = getLauncherApps();

  return (
    <section className="max-w-[1100px] w-full mx-auto px-6 pt-12 pb-16 flex-1">
      <div className="mb-10 text-center">
        <h1 className="font-display text-[clamp(40px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
          {t.apps.title}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
        {apps.map((app) => {
          const card = (
            <Card
              className={
                app.available
                  ? "hover:bg-muted/40 transition-colors"
                  : "opacity-80"
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted"
                      aria-hidden
                    >
                      <app.icon className="size-6" style={{ color: ACCENT }} />
                    </span>
                    {app.displayName}
                  </CardTitle>
                  {!app.available && (
                    <Badge variant="secondary">{t.apps.comingSoon}</Badge>
                  )}
                </div>
                <CardDescription>{t.apps.shortDescriptions[app.id]}</CardDescription>
              </CardHeader>
            </Card>
          );

          if (app.available && app.href) {
            return (
              <Link
                key={app.id}
                href={app.href}
                aria-label={t.apps.openApp.replace("{name}", app.displayName)}
              >
                {card}
              </Link>
            );
          }

          return (
            <div
              key={app.id}
              aria-disabled="true"
              aria-label={`${app.displayName} — ${t.apps.comingSoon}`}
            >
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
}

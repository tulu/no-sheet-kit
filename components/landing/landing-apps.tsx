"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { getLauncherApps } from "@/components/apps/launcher-apps";
import { getAppHref } from "@/lib/apps/catalog";
import { getSolutionHref } from "@/lib/seo/site-indexing";

const ACCENT = "#519186";

export function LandingApps() {
  const { t } = useI18n();
  const appCopy = t.landing.apps.cards;
  const apps = getLauncherApps();

  return (
    <section
      id="apps"
      className="max-w-[1100px] mx-auto px-6 pt-24 pb-24 reveal"
    >
      <div className="mb-12">
        <h2 className="font-display text-[clamp(44px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
          {t.landing.apps.titleStart}
          <br />
          <em className="italic" style={{ color: ACCENT }}>
            {t.landing.apps.titleEmphasis}
          </em>{" "}
          {t.landing.apps.titleEnd}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        {apps.map((app) => {
          const card = (
            <Card
              className={`reveal flex flex-col ${
                app.available
                  ? "h-full hover:bg-muted/40 transition-colors"
                  : "opacity-80"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="flex items-center gap-3.5 text-lg">
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
                <CardDescription>
                  {appCopy[app.id].desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="flex flex-col gap-2">
                  {appCopy[app.id].features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                        style={{ background: ACCENT }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );

          const marketingHref =
            app.available ? getSolutionHref(app.id) ?? getAppHref(app.id) : null;

          if (app.available && marketingHref) {
            return (
              <Link
                key={app.id}
                href={marketingHref}
                className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

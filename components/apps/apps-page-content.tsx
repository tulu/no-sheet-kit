"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { getLauncherApps } from "@/components/apps/launcher-apps";
import { APP_ORDER, type AppId } from "@/lib/apps/catalog";
import { getSavedElementCountForApp } from "@/lib/apps/list-app-saved-counts";
import { allListAppStorageKeysForSuffix } from "@/lib/storage/session-storage-keys";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";

const ACCENT = "#519186";

const launcherSavedBadgeBase =
  "max-w-[min(100%,13rem)] shrink-0 rounded-full px-2.5 py-1 text-xs ring-1 ring-foreground/10";

export function AppsPageContent() {
  const { t } = useI18n();
  const apps = getLauncherApps();
  const sessionSuffix = useSessionStorageSuffix();
  const [counts, setCounts] = useState<Record<AppId, number> | null>(null);

  const refreshCounts = useCallback(() => {
    const next = {} as Record<AppId, number>;
    for (const id of APP_ORDER) {
      next[id] = getSavedElementCountForApp(id, sessionSuffix);
    }
    setCounts(next);
  }, [sessionSuffix]);

  useEffect(() => {
    queueMicrotask(() => {
      refreshCounts();
    });
  }, [refreshCounts]);

  useEffect(() => {
    const keys = new Set(allListAppStorageKeysForSuffix(sessionSuffix));
    const onStorage = (ev: StorageEvent) => {
      if (ev.key && keys.has(ev.key)) refreshCounts();
    };
    window.addEventListener("storage", onStorage);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshCounts();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sessionSuffix, refreshCounts]);

  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-6 pt-12 pb-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-[clamp(40px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
          {t.apps.title}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
        {apps.map((app) => {
          const count = counts?.[app.id] ?? 0;
          const hasData = count > 0;
          const countLabel =
            count === 1
              ? t.apps.launcherSavedCountOne.replace("{count}", String(count))
              : t.apps.launcherSavedCountMany.replace("{count}", String(count));

          const countBadge =
            counts == null ? null : hasData ? (
              <Badge
                variant="secondary"
                className={`${launcherSavedBadgeBase} font-semibold leading-tight`}
                title={countLabel}
              >
                {countLabel}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={`${launcherSavedBadgeBase} font-medium leading-snug text-muted-foreground`}
                title={t.apps.launcherSavedEmptyTitle}
              >
                {t.apps.launcherSavedEmptyBadge}
              </Badge>
            );

          const card = (
            <Card
              className={`h-full ${app.available ? "hover:bg-muted/40 transition-colors" : "opacity-80"}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex min-w-0 items-center gap-3 text-lg">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted"
                      aria-hidden
                    >
                      <app.icon className="size-6" style={{ color: ACCENT }} />
                    </span>
                    <span className="truncate">{app.displayName}</span>
                  </CardTitle>
                  <div className="flex shrink-0 items-center">
                    {app.available ? countBadge : (
                      <Badge variant="secondary" className="shrink-0">
                        {t.apps.comingSoon}
                      </Badge>
                    )}
                  </div>
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

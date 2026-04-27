"use client";

import Link from "next/link";
import { useState } from "react";
import { Grid3X3 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { getLauncherApps } from "@/components/apps/launcher-apps";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ACCENT = "#519186";

export function AppsSwitcher() {
  const { t } = useI18n();
  const apps = getLauncherApps();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={t.apps.switcherTitle}
            aria-expanded={open}
            className="inline-flex size-10 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-muted/60 md:size-12"
          />
        }
      >
        <Grid3X3 className="size-5 text-muted-foreground md:size-6" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        positionMethod="fixed"
        collisionPadding={16}
        className="flex w-[min(360px,calc(100vw-3rem))] max-w-[calc(100vw-3rem)] max-h-[85vh] origin-top-right flex-col gap-0 p-0"
      >
        <div className="border-b border-border px-4 py-3">
          <p className="text-center text-sm font-medium text-foreground">{t.apps.switcherTitle}</p>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-3 overflow-y-auto p-1.5">
          {apps.map((app) =>
            app.available && app.href ? (
              <Link
                key={app.id}
                href={app.href}
                onClick={() => setOpen(false)}
                className="flex flex-col items-center justify-start rounded-xl border border-transparent px-2 py-2 text-center transition-colors hover:bg-muted"
                aria-label={t.apps.openApp.replace("{name}", app.displayName)}
              >
                <span
                  className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-muted"
                  aria-hidden
                >
                  <app.icon className="size-5" style={{ color: ACCENT }} />
                </span>
                <span className="text-xs leading-tight text-foreground">{app.displayName}</span>
              </Link>
            ) : (
              <div
                key={app.id}
                className="flex flex-col items-center justify-start rounded-xl border border-transparent px-2 py-2 text-center opacity-80"
              >
                <span
                  className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-muted"
                  aria-hidden
                >
                  <app.icon className="size-5" style={{ color: ACCENT }} />
                </span>
                <span className="text-xs leading-tight text-foreground">{app.displayName}</span>
                <span className="text-[10px] text-muted-foreground">{t.apps.comingSoon}</span>
              </div>
            )
          )}
        </div>

        <div className="border-t border-border p-1.5">
          <Link
            href="/apps"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t.apps.switcherViewAll}
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

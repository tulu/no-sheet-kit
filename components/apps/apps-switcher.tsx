"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Grid3X3 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { getLauncherApps } from "@/components/apps/launcher-apps";

const ACCENT = "#519186";

export function AppsSwitcher() {
  const { t } = useI18n();
  const apps = getLauncherApps();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t.apps.switcherTitle}
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-md border border-border bg-background size-9 text-foreground"
      >
        <Grid3X3 className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed right-6 top-[4.5rem] w-[360px] rounded-[28px] border border-border bg-popover p-4 shadow-xl z-50 origin-top-right">
          <div className="mb-4">
            <p className="text-base font-semibold text-foreground text-center">
              {t.apps.switcherTitle}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-x-2 gap-y-3">
            {apps.map((app) =>
              app.available && app.href ? (
                <Link
                  key={app.id}
                  href={app.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center justify-start rounded-xl border border-transparent px-2 py-2 text-center hover:bg-muted transition-colors"
                  aria-label={t.apps.openApp.replace("{name}", app.displayName)}
                >
                  <span
                    className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-muted"
                    aria-hidden
                  >
                    <app.icon className="size-5" style={{ color: ACCENT }} />
                  </span>
                  <span className="text-xs text-foreground leading-tight">
                    {app.displayName}
                  </span>
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
                  <span className="text-xs text-foreground leading-tight">
                    {app.displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t.apps.comingSoon}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <Link
              href="/apps"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t.apps.switcherViewAll}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

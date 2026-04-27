"use client";

import Link from "next/link";
import { Bell, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { APP_DISPLAY_ICONS, APP_DISPLAY_NAMES } from "@/lib/apps/app-display";
import { collectUpcomingNotifications } from "@/lib/notifications/collect-upcoming-notifications";
import { useI18n } from "@/components/providers/i18n-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  LIST_APP_DATA_UPDATED_EVENT,
  type ListAppDataUpdatedDetail,
} from "@/lib/storage/list-app-data-updated";
import { allListAppStorageKeysForSuffix } from "@/lib/storage/session-storage-keys";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import { cn } from "@/lib/utils";

/** Same accent as app launcher / landing app tiles. */
const APP_ICON_ACCENT = "#519186";

export function AppsUpcomingNotifications() {
  const sessionSuffix = useSessionStorageSuffix();
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  /** Avoid SSR vs client mismatch: list-app storage is empty on server, real on client. */
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    queueMicrotask(() => {
      setHydrated(true);
    });
  }, []);

  const bump = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  void tick;
  const items = hydrated
    ? collectUpcomingNotifications({
        sessionSuffix,
        now: new Date(),
        locale,
        t,
      })
    : [];

  useEffect(() => {
    const listKeys = new Set(allListAppStorageKeysForSuffix(sessionSuffix));
    const onListUpdated = (ev: Event) => {
      const ce = ev as CustomEvent<ListAppDataUpdatedDetail>;
      if (ce.detail?.sessionSuffix === sessionSuffix) bump();
    };
    const onStorage = (ev: StorageEvent) => {
      if (!ev.key || !listKeys.has(ev.key)) return;
      bump();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    window.addEventListener(LIST_APP_DATA_UPDATED_EVENT, onListUpdated);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", bump);
    return () => {
      window.removeEventListener(LIST_APP_DATA_UPDATED_EVENT, onListUpdated);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", bump);
    };
  }, [sessionSuffix, bump]);

  const count = items.length;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) bump();
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-muted/60 md:size-12"
            aria-label={t.apps.notifications.bellAria}
          />
        }
      >
        <Bell className="size-5 text-muted-foreground md:size-6" aria-hidden />
        {count > 0 ? (
          <span
            className="absolute right-1.5 top-2 size-2 rounded-full bg-red-500 md:right-2 md:top-2.5"
            aria-hidden
          />
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        positionMethod="fixed"
        collisionPadding={16}
        className="flex w-[min(calc(100vw-2rem),22rem)] max-h-[min(85vh,24rem)] flex-col gap-0 p-0"
      >
        <div className="border-b border-border px-4 py-3">
          <p className="text-center text-sm font-medium text-foreground">
            {t.apps.notifications.popoverTitle}
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-1.5">
          {count === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{t.apps.notifications.empty}</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {items.map((row) => {
                const AppIcon: LucideIcon = APP_DISPLAY_ICONS[row.appId];
                const appName = APP_DISPLAY_NAMES[row.appId];
                return (
                  <li key={row.id}>
                    <Link
                      href={row.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-md px-3 py-2.5 text-left text-sm",
                        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <AppIcon
                          className="size-3.5 shrink-0"
                          style={{ color: APP_ICON_ACCENT }}
                          aria-hidden
                        />
                        {appName}
                      </span>
                      <span className="text-xs leading-snug text-muted-foreground">
                        {row.kindLabel} · {row.dateLabel}
                      </span>
                      <span className="font-medium leading-snug text-foreground">{row.itemTitle}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

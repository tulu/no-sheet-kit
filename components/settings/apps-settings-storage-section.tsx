"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import { Progress } from "@/components/ui/progress";
import {
  formatStorageBytes,
  getAppStorageUsage,
  MAX_LOCAL_STORAGE_PER_APP_BYTES,
  type AppStorageUsage,
} from "@/lib/apps/storage-usage";

export function AppsSettingsStorageSection() {
  const { t } = useI18n();
  const sessionSuffix = useSessionStorageSuffix();
  const [items, setItems] = useState<AppStorageUsage[]>([]);

  const refresh = useCallback(() => {
    setItems(getAppStorageUsage(sessionSuffix));
  }, [sessionSuffix]);

  useEffect(() => {
    queueMicrotask(() => {
      refresh();
    });
    const onStorage = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const totalBytes = items.reduce((acc, item) => acc + item.usedBytes, 0);
  const maxBytesLabel = formatStorageBytes(MAX_LOCAL_STORAGE_PER_APP_BYTES);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t.apps.settings.storage.title}</h2>
        <div className="mt-2 border-b border-border" />
        <p className="mt-4 text-sm text-muted-foreground">
          {t.apps.settings.storage.description.replace("{max}", maxBytesLabel)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t.apps.settings.storage.totalUsed.replace("{used}", formatStorageBytes(totalBytes))}
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map((item) => {
          const percentLabel = `${Math.round(item.usedPercent)}%`;
          return (
            <li key={item.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{item.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {t.apps.settings.storage.usedOfMax
                    .replace("{used}", formatStorageBytes(item.usedBytes))
                    .replace("{max}", maxBytesLabel)}
                </p>
              </div>
              <Progress
                className="mt-2"
                value={item.usedPercent}
                aria-label={t.apps.settings.storage.progressAria
                  .replace("{app}", item.displayName)
                  .replace("{percent}", percentLabel)}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{percentLabel}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

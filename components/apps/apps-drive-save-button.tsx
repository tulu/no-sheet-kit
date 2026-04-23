"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  buildSessionGuestDataZipBlob,
  collectSessionGuestExportEntries,
} from "@/lib/storage/export-anonymous-guest-zip";
import { applyDriveSyncTimestampToAllListApps } from "@/lib/storage/apply-drive-sync-timestamp";
import {
  getPendingDriveSyncStorageKey,
  hasPendingDriveSync,
  PENDING_DRIVE_SYNC_CHANGED_EVENT,
} from "@/lib/storage/pending-drive-sync";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AppsDriveSaveButton() {
  const { t } = useI18n();
  const sessionSuffix = useSessionStorageSuffix();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);

  const refreshPending = useCallback(() => {
    setPending(hasPendingDriveSync(sessionSuffix));
  }, [sessionSuffix]);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  useEffect(() => {
    const onChanged = () => refreshPending();
    window.addEventListener(PENDING_DRIVE_SYNC_CHANGED_EVENT, onChanged);
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === getPendingDriveSyncStorageKey(sessionSuffix)) {
        refreshPending();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PENDING_DRIVE_SYNC_CHANGED_EVENT, onChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [sessionSuffix, refreshPending]);

  async function onSave() {
    if (busy || !hasPendingDriveSync(sessionSuffix)) return;
    setBusy(true);
    try {
      const entries = collectSessionGuestExportEntries(sessionSuffix);
      const blob = await buildSessionGuestDataZipBlob(entries);
      const res = await fetch("/api/google/drive/save", {
        method: "POST",
        headers: { "Content-Type": "application/zip" },
        body: blob,
      });
      const data = (await res.json().catch(() => ({}))) as {
        syncedAt?: string;
        error?: string;
        step?: string;
        googleStatus?: number;
        googleDetail?: string;
      };
      if (!res.ok) {
        const statusSuffix = typeof data.googleStatus === "number" ? ` (${data.googleStatus})` : "";
        const detail =
          typeof data.googleDetail === "string" && data.googleDetail.length > 0
            ? `${data.googleDetail}${statusSuffix}`
            : statusSuffix || undefined;
        toast.error(t.apps.driveSave.error, detail ? { description: detail.slice(0, 400) } : undefined);
        return;
      }
      const syncedAt = typeof data.syncedAt === "string" ? data.syncedAt : new Date().toISOString();
      applyDriveSyncTimestampToAllListApps(sessionSuffix, syncedAt);
      toast.success(t.apps.driveSave.success);
    } catch {
      toast.error(t.apps.driveSave.error);
    } finally {
      setBusy(false);
    }
  }

  const canSave = pending && !busy;
  const label = busy
    ? t.apps.driveSave.labelSaving
    : pending
      ? t.apps.driveSave.labelDirty
      : t.apps.driveSave.labelSynced;

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={!canSave}
      className={cn("h-10 shrink-0 rounded-full px-4")}
      title={pending ? t.apps.driveSave.tooltipDirty : t.apps.driveSave.tooltipSynced}
      aria-label={pending ? t.apps.driveSave.ariaLabelDirty : t.apps.driveSave.ariaLabelSynced}
      onClick={() => void onSave()}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            pending ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.85)]" : "bg-emerald-500"
          )}
          aria-hidden
        />
        {label}
      </span>
    </Button>
  );
}

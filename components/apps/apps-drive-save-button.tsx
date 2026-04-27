"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
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
import { trackGoogleDriveSyncCompleted } from "@/lib/analytics/events";
import { toast } from "sonner";

export function AppsDriveSaveButton() {
  const { t } = useI18n();
  const sessionSuffix = useSessionStorageSuffix();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);

  const refreshState = useCallback(() => {
    setPending(hasPendingDriveSync(sessionSuffix));
    setHasLocalData(collectSessionGuestExportEntries(sessionSuffix).length > 0);
  }, [sessionSuffix]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  useEffect(() => {
    const onChanged = () => refreshState();
    window.addEventListener(PENDING_DRIVE_SYNC_CHANGED_EVENT, onChanged);
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === getPendingDriveSyncStorageKey(sessionSuffix)) {
        refreshState();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PENDING_DRIVE_SYNC_CHANGED_EVENT, onChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [sessionSuffix, refreshState]);

  async function onSave() {
    if (busy || !hasLocalData || !hasPendingDriveSync(sessionSuffix)) return;
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
      trackGoogleDriveSyncCompleted();
      toast.success(t.apps.driveSave.success);
    } catch {
      toast.error(t.apps.driveSave.error);
    } finally {
      setBusy(false);
    }
  }

  const canSave = hasLocalData && pending && !busy;
  const label = busy
    ? t.apps.driveSave.labelSaving
    : pending
      ? t.apps.driveSave.labelDirty
      : t.apps.driveSave.labelSynced;
  const tooltip = pending
    ? t.apps.driveSave.tooltipDirty
    : t.apps.driveSave.tooltipSynced;
  const ariaLabel = pending
    ? t.apps.driveSave.ariaLabelDirty
    : t.apps.driveSave.ariaLabelSynced;
  const MobileStatusIcon = busy
    ? Loader2
    : pending
      ? TriangleAlert
      : CheckCircle2;
  const mobileShortLabel = busy
    ? t.apps.driveSave.mobileShortSaving
    : pending
      ? t.apps.driveSave.mobileShortDirty
      : t.apps.driveSave.mobileShortSynced;

  if (!hasLocalData) return null;

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={!canSave}
      className={cn("h-10 shrink-0 rounded-full px-2.5 md:px-4")}
      title={tooltip}
      aria-label={ariaLabel}
      onClick={() => void onSave()}
    >
      <span className="flex items-center gap-2">
        <MobileStatusIcon
          className={cn(
            "size-4 shrink-0 md:hidden",
            busy && "animate-spin",
            !busy && !hasLocalData && "text-muted-foreground",
            !busy && pending && "text-amber-500",
            !busy && hasLocalData && !pending && "text-emerald-500"
          )}
          aria-hidden
        />
        <span className="text-[11px] font-medium leading-none md:hidden">{mobileShortLabel}</span>
        <span
          className={cn(
            "hidden size-2 shrink-0 rounded-full md:inline-block",
            !hasLocalData
              ? "bg-muted-foreground/60"
              : pending
                ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.85)]"
                : "bg-emerald-500"
          )}
          aria-hidden
        />
        <span className="hidden md:inline">{label}</span>
      </span>
    </Button>
  );
}

"use client";

import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import {
  buildSessionGuestDataZipBlob,
  collectSessionGuestExportEntries,
  downloadZipBlob,
  guestBackupZipFilename,
  GuestBackupRestoreError,
  restoreSessionGuestDataFromZipFile,
} from "@/lib/storage/export-anonymous-guest-zip";
import {
  clearPendingDriveSync,
  markPendingDriveSync,
  PENDING_DRIVE_SYNC_CHANGED_EVENT,
} from "@/lib/storage/pending-drive-sync";
import { clearAllListAppLocalStorageForSuffix } from "@/lib/storage/session-storage-keys";
import {
  trackGoogleDriveBackupDeleted,
  trackLocalDataCleared,
} from "@/lib/analytics/events";
import { toast } from "sonner";

type SessionJson =
  | { kind: "none" | "anonymous" }
  | { kind: "google"; sub: string; email: string | null; name?: string | null };

type ConfirmAction = "restore_file" | "restore_drive" | "delete_local" | "delete_drive";

export function AppsSettingsDataManagementSection() {
  const { t } = useI18n();
  const sessionSuffix = useSessionStorageSuffix();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<SessionJson | null>(null);
  const [dataBusy, setDataBusy] = useState<ConfirmAction | "download" | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [hasDriveBackup, setHasDriveBackup] = useState(false);
  const [checkingDriveBackup, setCheckingDriveBackup] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/session");
      const data = (await res.json()) as SessionJson;
      setSession(data);
    })();
  }, []);

  const isGoogle = session?.kind === "google";

  const refreshLocalDataAvailability = useCallback(() => {
    setHasLocalData(collectSessionGuestExportEntries(sessionSuffix).length > 0);
  }, [sessionSuffix]);

  const refreshDriveBackupAvailability = useCallback(async () => {
    if (!isGoogle) {
      setHasDriveBackup(false);
      setCheckingDriveBackup(false);
      return;
    }
    setCheckingDriveBackup(true);
    try {
      const res = await fetch("/api/google/drive/backup", { method: "HEAD", cache: "no-store" });
      setHasDriveBackup(res.status === 204);
    } catch {
      setHasDriveBackup(false);
    } finally {
      setCheckingDriveBackup(false);
    }
  }, [isGoogle]);

  useEffect(() => {
    if (!session) return;
    if (session.kind !== "google") setCheckingDriveBackup(false);
  }, [session]);

  useEffect(() => {
    queueMicrotask(() => {
      refreshLocalDataAvailability();
      void refreshDriveBackupAvailability();
    });

    const onStorage = () => refreshLocalDataAvailability();
    const onPendingDriveChanged = () => {
      refreshLocalDataAvailability();
      void refreshDriveBackupAvailability();
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      refreshLocalDataAvailability();
      void refreshDriveBackupAvailability();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(PENDING_DRIVE_SYNC_CHANGED_EVENT, onPendingDriveChanged);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PENDING_DRIVE_SYNC_CHANGED_EVENT, onPendingDriveChanged);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshLocalDataAvailability, refreshDriveBackupAvailability]);

  async function onDownloadBackup() {
    if (dataBusy) return;
    setDataBusy("download");
    try {
      const entries = collectSessionGuestExportEntries(sessionSuffix);
      if (entries.length === 0) {
        setHasLocalData(false);
        toast.error(t.apps.settings.dataManagement.noDataToDownload);
        return;
      }
      const blob = await buildSessionGuestDataZipBlob(entries);
      downloadZipBlob(blob, guestBackupZipFilename());
      toast.success(t.apps.settings.dataManagement.downloadSuccess);
    } catch {
      toast.error(t.apps.settings.dataManagement.downloadError);
    } finally {
      setDataBusy(null);
    }
  }

  function onPickRestoreFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file || dataBusy) return;
    setPendingRestoreFile(file);
    setConfirmAction("restore_file");
  }

  async function onConfirmDataAction() {
    if (!confirmAction || dataBusy) return;
    const action = confirmAction;
    setDataBusy(action);
    try {
      if (action === "restore_file") {
        const file = pendingRestoreFile;
        if (!file) return;
        try {
          await restoreSessionGuestDataFromZipFile(file, sessionSuffix);
        } catch (err) {
          if (err instanceof GuestBackupRestoreError) {
            toast.error(t.apps.settings.dataManagement.restoreFileError);
            return;
          }
          throw err;
        }
        markPendingDriveSync(sessionSuffix);
        refreshLocalDataAvailability();
        toast.success(t.apps.settings.dataManagement.restoreFileSuccess);
      } else if (action === "restore_drive") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("drive_restore", "1");
        const next = `/apps/settings?${params.toString()}`;
        window.location.replace(next);
        return;
      } else if (action === "delete_local") {
        clearAllListAppLocalStorageForSuffix(sessionSuffix);
        clearPendingDriveSync(sessionSuffix);
        setHasLocalData(false);
        trackLocalDataCleared("settings");
        toast.success(t.apps.settings.dataManagement.deleteLocalSuccess);
      } else if (action === "delete_drive") {
        const res = await fetch("/api/google/drive/backup", { method: "DELETE" });
        if (!res.ok) {
          toast.error(t.apps.settings.dataManagement.deleteDriveError);
          return;
        }
        setHasDriveBackup(false);
        trackGoogleDriveBackupDeleted();
        toast.success(t.apps.settings.dataManagement.deleteDriveSuccess);
      }
    } catch {
      toast.error(t.apps.settings.dataManagement.genericActionError);
    } finally {
      setDataBusy(null);
      setConfirmAction(null);
      setPendingRestoreFile(null);
    }
  }

  return (
    <div className="space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onPickRestoreFile}
      />

      <section>
        <h2 className="text-base font-semibold text-foreground">
          {t.apps.settings.dataManagement.importExportTitle}
        </h2>
        <div className="mt-2 border-b border-border" />
        <p className="mt-4 text-sm text-muted-foreground">
          {t.apps.settings.dataManagement.importExportDescription}
        </p>
        {isGoogle && checkingDriveBackup ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-44 rounded-md" />
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {hasLocalData ? (
              <Button
                type="button"
                variant="outline"
                disabled={dataBusy !== null}
                onClick={() => void onDownloadBackup()}
              >
                {t.apps.settings.dataManagement.downloadBackup}
              </Button>
            ) : (
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "pointer-events-none inline-flex cursor-help opacity-50"
                      )}
                      aria-disabled
                    >
                      {t.apps.settings.dataManagement.downloadBackup}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t.apps.settings.dataManagement.localDataMissingHint}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={dataBusy !== null}
              onClick={() => fileInputRef.current?.click()}
            >
              {t.apps.settings.dataManagement.restoreFromFile}
            </Button>
            {isGoogle ? (
              <>
                {hasDriveBackup ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={dataBusy !== null}
                    onClick={() => setConfirmAction("restore_drive")}
                  >
                    {t.apps.settings.dataManagement.restoreFromDrive}
                  </Button>
                ) : (
                  <TooltipProvider delay={150}>
                    <Tooltip>
                      <TooltipTrigger>
                        <span
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "pointer-events-none inline-flex cursor-help opacity-50"
                          )}
                          aria-disabled
                        >
                          {t.apps.settings.dataManagement.restoreFromDrive}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t.apps.settings.dataManagement.driveBackupMissingHint}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            ) : null}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">{t.apps.settings.dataManagement.dangerZoneTitle}</h2>
        <div className="mt-2 border-b border-border" />
        <p className="mt-4 text-sm text-muted-foreground">{t.apps.settings.dataManagement.dangerZoneDescription}</p>
        {isGoogle && checkingDriveBackup ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-9 w-44 rounded-md" />
            <Skeleton className="h-9 w-44 rounded-md" />
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {hasLocalData ? (
              <Button
                type="button"
                variant="destructive"
                disabled={dataBusy !== null}
                onClick={() => setConfirmAction("delete_local")}
              >
                {t.apps.settings.dataManagement.deleteLocalData}
              </Button>
            ) : (
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className={cn(
                        buttonVariants({ variant: "destructive" }),
                        "pointer-events-none inline-flex cursor-help opacity-50"
                      )}
                      aria-disabled
                    >
                      {t.apps.settings.dataManagement.deleteLocalData}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t.apps.settings.dataManagement.localDataMissingHint}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isGoogle ? (
              <>
                {hasDriveBackup ? (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={dataBusy !== null}
                    onClick={() => setConfirmAction("delete_drive")}
                  >
                    {t.apps.settings.dataManagement.deleteDriveBackup}
                  </Button>
                ) : (
                  <TooltipProvider delay={150}>
                    <Tooltip>
                      <TooltipTrigger>
                        <span
                          className={cn(
                            buttonVariants({ variant: "destructive" }),
                            "pointer-events-none inline-flex cursor-help opacity-50"
                          )}
                          aria-disabled
                        >
                          {t.apps.settings.dataManagement.deleteDriveBackup}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t.apps.settings.dataManagement.driveBackupMissingHint}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            ) : null}
          </div>
        )}
      </section>

      <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "restore_file"
                ? t.apps.settings.dataManagement.confirmRestoreFileTitle
                : confirmAction === "restore_drive"
                  ? t.apps.settings.dataManagement.confirmRestoreDriveTitle
                  : confirmAction === "delete_local"
                    ? t.apps.settings.dataManagement.confirmDeleteLocalTitle
                    : t.apps.settings.dataManagement.confirmDeleteDriveTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "restore_file"
                ? t.apps.settings.dataManagement.confirmRestoreFileDescription
                : confirmAction === "restore_drive"
                  ? t.apps.settings.dataManagement.confirmRestoreDriveDescription
                  : confirmAction === "delete_local"
                    ? isGoogle
                      ? t.apps.settings.dataManagement.confirmDeleteLocalDescription
                      : t.apps.settings.dataManagement.confirmDeleteLocalDescriptionGuest
                    : t.apps.settings.dataManagement.confirmDeleteDriveDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dataBusy !== null}>
              {t.apps.settings.dataManagement.confirmCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={dataBusy !== null}
              onClick={(event) => {
                event.preventDefault();
                void onConfirmDataAction();
              }}
            >
              {t.apps.settings.dataManagement.confirmAccept}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

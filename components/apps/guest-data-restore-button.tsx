"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Upload } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  collectAnonymousGuestExportEntries,
  GuestBackupRestoreError,
  restoreAnonymousGuestDataFromZipFile,
} from "@/lib/storage/export-anonymous-guest-zip";
import {
  LIST_APP_DATA_UPDATED_EVENT,
  type ListAppDataUpdatedDetail,
} from "@/lib/storage/list-app-data-updated";
import { SESSION_SUFFIX_ANONYMOUS } from "@/lib/storage/session-storage-keys";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type GuestDataRestoreButtonProps = {
  /** When false (e.g. Google session), ZIP restore from disk is hidden — Drive handles backup. */
  allowLocalZipRestore?: boolean;
};

export function GuestDataRestoreButton({ allowLocalZipRestore = true }: GuestDataRestoreButtonProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [hasGuestData, setHasGuestData] = useState(true);

  const refreshHasData = useCallback(() => {
    setHasGuestData(collectAnonymousGuestExportEntries().length > 0);
  }, []);

  useEffect(() => {
    refreshHasData();
  }, [pathname, refreshHasData]);

  useEffect(() => {
    function onStorage(ev: StorageEvent) {
      if (!ev.key) return;
      if (ev.key.endsWith("Anonym")) refreshHasData();
    }
    function onListAppDataUpdated(ev: Event) {
      const detail = (ev as CustomEvent<ListAppDataUpdatedDetail>).detail;
      if (detail?.sessionSuffix !== SESSION_SUFFIX_ANONYMOUS) return;
      refreshHasData();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(LIST_APP_DATA_UPDATED_EVENT, onListAppDataUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LIST_APP_DATA_UPDATED_EVENT, onListAppDataUpdated);
    };
  }, [refreshHasData]);

  if (!allowLocalZipRestore) return null;

  if (hasGuestData) return null;

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    setBusy(true);
    try {
      await restoreAnonymousGuestDataFromZipFile(file);
      toast.success(t.apps.guestRestore.successToast);
      window.setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err) {
      if (err instanceof GuestBackupRestoreError) {
        const map = {
          INVALID_ZIP: t.apps.guestRestore.errorInvalidZip,
          NO_FILES: t.apps.guestRestore.errorNoFiles,
          BAD_JSON: t.apps.guestRestore.errorBadJson,
          FILE_TOO_LARGE: t.apps.guestRestore.errorTooLarge,
        } as const;
        toast.error(map[err.code]);
      } else {
        toast.error(t.apps.guestRestore.errorInvalidZip);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        title={t.apps.guestRestore.tooltip}
        aria-label={t.apps.guestRestore.tooltip}
        className={cn(
          "hidden md:inline-flex",
          "h-12 shrink-0 gap-2 rounded-full border-border px-3 sm:px-3.5",
          "text-foreground hover:bg-muted/60"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="hidden max-w-[10rem] truncate sm:inline">{t.apps.guestRestore.button}</span>
        <span className="sm:hidden">{t.apps.guestRestore.buttonShort}</span>
      </Button>
    </>
  );
}

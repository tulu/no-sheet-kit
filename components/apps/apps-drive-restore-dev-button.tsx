"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
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

export function AppsDriveRestoreDevButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function onConfirmRestore() {
    if (busy) return;
    setBusy(true);
    setOpen(false);
    const url = new URL(window.location.href);
    url.pathname = "/apps";
    url.searchParams.set("drive_restore", "1");
    window.location.replace(`${url.pathname}${url.search}`);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-10 shrink-0 rounded-full px-4"
        onClick={() => setOpen(true)}
        disabled={busy}
        title={t.apps.driveRestore.devTooltip}
        aria-label={t.apps.driveRestore.devTooltip}
      >
        {busy ? t.apps.driveRestore.devLoading : t.apps.driveRestore.devButton}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.apps.driveRestore.devConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.apps.driveRestore.devConfirmDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>
            {t.apps.driveRestore.devConfirmCancel}
          </AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={() => onConfirmRestore()}>
            {t.apps.driveRestore.devConfirmAccept}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

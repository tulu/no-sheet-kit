"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  buildAnonymousGuestDataZipBlob,
  collectAnonymousGuestExportEntries,
  downloadZipBlob,
  guestBackupZipFilename,
} from "@/lib/storage/export-anonymous-guest-zip";
import { clearAllAnonymousAppLocalStorage } from "@/lib/storage/anonymous-storage-keys";
import { clearPendingDriveSync, hasPendingDriveSync } from "@/lib/storage/pending-drive-sync";
import { clearGoogleCalendarIdLocal } from "@/lib/storage/google-calendar-local";
import {
  clearGoogleProfileLocal,
  readGoogleProfileLocal,
  type StoredGoogleProfile,
} from "@/lib/storage/google-profile-local";
import { clearAllListAppLocalStorageForSuffix } from "@/lib/storage/session-storage-keys";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type AppsUserMenuProps = {
  sessionKind: "anonymous" | "google";
  storageSuffix: string;
  googleEmail?: string;
  googleSub?: string;
  googleName?: string;
  googlePicture?: string;
};

export function AppsUserMenu({
  sessionKind,
  storageSuffix,
  googleEmail,
  googleSub,
  googleName,
  googlePicture,
}: AppsUserMenuProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [profile, setProfile] = useState<StoredGoogleProfile | null>(null);

  useEffect(() => {
    if (sessionKind !== "google" || !googleSub) {
      setProfile(null);
      return;
    }
    setProfile(readGoogleProfileLocal(googleSub));
  }, [sessionKind, googleSub]);

  const hasAnonymousGuestData =
    logoutOpen && sessionKind === "anonymous" && collectAnonymousGuestExportEntries().length > 0;

  const googlePendingSync =
    logoutOpen && sessionKind === "google" && hasPendingDriveSync(storageSuffix);

  type LogoutChoice = "keep" | "delete" | "downloadDelete" | "sessionOnly";

  async function finishAnonymousLogout(choice: LogoutChoice) {
    if (logoutBusy) return;
    setLogoutBusy(true);
    try {
      if (choice === "downloadDelete") {
        const entries = collectAnonymousGuestExportEntries();
        try {
          const blob = await buildAnonymousGuestDataZipBlob(entries);
          downloadZipBlob(blob, guestBackupZipFilename());
        } catch {
          toast.error(t.apps.logoutDialog.exportFailed);
          return;
        }
      }

      setLogoutOpen(false);
      setMenuOpen(false);

      if (choice === "delete" || choice === "downloadDelete") {
        clearAllAnonymousAppLocalStorage();
      }

      const logoutRes = await fetch("/api/auth/logout", { method: "POST" });
      if (!logoutRes.ok) return;
      router.replace("/login");
    } finally {
      setLogoutBusy(false);
    }
  }

  async function finishGoogleLogout() {
    if (logoutBusy) return;
    setLogoutBusy(true);
    try {
      setLogoutOpen(false);
      setMenuOpen(false);

      clearAllListAppLocalStorageForSuffix(storageSuffix);
      clearPendingDriveSync(storageSuffix);
      if (googleSub) {
        clearGoogleProfileLocal(googleSub);
        clearGoogleCalendarIdLocal(googleSub);
      }

      const logoutRes = await fetch("/api/auth/logout", { method: "POST" });
      if (!logoutRes.ok) return;
      router.replace("/login");
    } finally {
      setLogoutBusy(false);
    }
  }

  const primaryLabel =
    sessionKind === "google"
      ? (googleName?.trim() ||
          profile?.name?.trim() ||
          googleEmail?.trim() ||
          t.apps.userMenu.googleLabel)
      : t.apps.userMenu.guestLabel;

  const showGoogleEmailRow =
    sessionKind === "google" &&
    Boolean(googleEmail?.trim()) &&
    primaryLabel.trim() !== googleEmail!.trim();

  const avatarUrl =
    sessionKind === "google" ? (profile?.picture ?? googlePicture) : undefined;

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground outline-none transition-colors",
                "hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={t.apps.userMenu.openAccountMenu}
            />
          }
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Google profile URLs are external and dynamic.
            <img src={avatarUrl} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <CircleUserRound className="size-7" aria-hidden />
          )}
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={10} className="w-72 p-0">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground"
                aria-hidden
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Google profile URLs are external and dynamic.
                  <img src={avatarUrl} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <CircleUserRound className="size-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-foreground">{primaryLabel}</p>
                {showGoogleEmailRow ? (
                  <p className="truncate text-xs text-muted-foreground">{googleEmail}</p>
                ) : null}
              </div>
            </div>
          </div>
          <nav className="flex flex-col p-1.5" aria-label={t.apps.userMenu.label}>
            <Link
              href="/apps/settings"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted"
            >
              {t.apps.userMenu.settings}
            </Link>
            <button
              type="button"
              className="rounded-md px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted"
              onClick={() => {
                setMenuOpen(false);
                setLogoutOpen(true);
              }}
            >
              {t.apps.userMenu.logout}
            </button>
          </nav>
        </PopoverContent>
      </Popover>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent size="default" className="max-w-md sm:max-w-md">
          {sessionKind === "google" ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {googlePendingSync ? t.apps.googleLogout.pendingTitle : t.apps.logoutDialog.title}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {googlePendingSync
                    ? t.apps.googleLogout.pendingDescription
                    : t.apps.googleLogout.noPendingDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {googlePendingSync ? (
                <p className="text-sm text-muted-foreground">{t.apps.googleLogout.saveFirstHint}</p>
              ) : null}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full"
                  disabled={logoutBusy}
                  onClick={() => void finishGoogleLogout()}
                >
                  {googlePendingSync ? t.apps.googleLogout.signOutAnyway : t.apps.logoutDialog.signOutOnly}
                </Button>
              </div>
              <AlertDialogFooter className="border-t-0 pt-0 sm:justify-center">
                <AlertDialogCancel disabled={logoutBusy}>{t.apps.logoutDialog.cancel}</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.apps.logoutDialog.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {hasAnonymousGuestData
                    ? t.apps.logoutDialog.description
                    : t.apps.logoutDialog.noDataDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {hasAnonymousGuestData ? (
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={logoutBusy}
                    onClick={() => void finishAnonymousLogout("keep")}
                  >
                    {t.apps.logoutDialog.keepData}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={logoutBusy}
                    onClick={() => void finishAnonymousLogout("downloadDelete")}
                  >
                    {t.apps.logoutDialog.downloadAndDelete}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={logoutBusy}
                    onClick={() => void finishAnonymousLogout("delete")}
                  >
                    {t.apps.logoutDialog.deleteData}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={logoutBusy}
                    onClick={() => void finishAnonymousLogout("sessionOnly")}
                  >
                    {t.apps.logoutDialog.signOutOnly}
                  </Button>
                </div>
              )}
              <AlertDialogFooter className="border-t-0 pt-0 sm:justify-center">
                <AlertDialogCancel disabled={logoutBusy}>{t.apps.logoutDialog.cancel}</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

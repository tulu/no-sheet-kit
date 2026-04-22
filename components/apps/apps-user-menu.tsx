"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AppsUserMenu() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);

  const hasAnonymousGuestData =
    logoutOpen && collectAnonymousGuestExportEntries().length > 0;

  const settingsHref =
    pathname.startsWith("/apps") && !pathname.startsWith("/apps/settings")
      ? `/apps/settings?returnTo=${encodeURIComponent(pathname)}`
      : "/apps/settings";

  type LogoutChoice = "keep" | "delete" | "downloadDelete" | "sessionOnly";

  async function finishLogout(choice: LogoutChoice) {
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

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "relative flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground outline-none transition-colors",
                "hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={t.apps.userMenu.openAccountMenu}
            />
          }
        >
          <CircleUserRound className="size-7" aria-hidden />
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={10} className="w-72 p-0">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground"
                aria-hidden
              >
                <CircleUserRound className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-foreground">{t.apps.userMenu.guestLabel}</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-col p-1.5" aria-label={t.apps.userMenu.label}>
            <Link
              href={settingsHref}
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
                onClick={() => void finishLogout("keep")}
              >
                {t.apps.logoutDialog.keepData}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={logoutBusy}
                onClick={() => void finishLogout("downloadDelete")}
              >
                {t.apps.logoutDialog.downloadAndDelete}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={logoutBusy}
                onClick={() => void finishLogout("delete")}
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
                onClick={() => void finishLogout("sessionOnly")}
              >
                {t.apps.logoutDialog.signOutOnly}
              </Button>
            </div>
          )}
          <AlertDialogFooter className="border-t-0 pt-0 sm:justify-center">
            <AlertDialogCancel disabled={logoutBusy}>{t.apps.logoutDialog.cancel}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

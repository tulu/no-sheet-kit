"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { restoreSessionGuestDataFromZipFile } from "@/lib/storage/export-anonymous-guest-zip";
import { clearPendingDriveSync } from "@/lib/storage/pending-drive-sync";
import { writeGoogleProfileLocal } from "@/lib/storage/google-profile-local";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import { cn } from "@/lib/utils";
import {
  NSK_LOGIN_PENDING_GOOGLE_VALUE,
  NSK_LOGIN_PENDING_SESSION_KEY,
  trackGoogleDriveRestoreCompleted,
  trackLoginCompleted,
} from "@/lib/analytics/events";

export function GoogleDriveRestoreBootstrap({ isGoogleSession }: { isGoogleSession: boolean }) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const sessionSuffix = useSessionStorageSuffix();
  const ranRef = useRef(false);
  const profileRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  const driveRestoreRequested =
    isGoogleSession && searchParams.get("drive_restore") === "1";

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isGoogleSession) return;
    try {
      if (sessionStorage.getItem(NSK_LOGIN_PENDING_SESSION_KEY) === NSK_LOGIN_PENDING_GOOGLE_VALUE) {
        sessionStorage.removeItem(NSK_LOGIN_PENDING_SESSION_KEY);
        trackLoginCompleted("google");
      }
    } catch {
      /* ignore */
    }
  }, [isGoogleSession]);

  useEffect(() => {
    if (!driveRestoreRequested) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [driveRestoreRequested]);

  useEffect(() => {
    if (!isGoogleSession || profileRef.current) return;
    profileRef.current = true;
    void (async () => {
      const meRes = await fetch("/api/google/me");
      if (!meRes.ok) return;
      const me = (await meRes.json()) as {
        sub: string;
        email?: string;
        name?: string;
        picture?: string;
      };
      writeGoogleProfileLocal(me.sub, me);
    })();
  }, [isGoogleSession]);

  useEffect(() => {
    if (!isGoogleSession || ranRef.current) return;
    if (searchParams.get("drive_restore") !== "1") return;
    ranRef.current = true;

    void (async () => {
      let restoreSuccess = false;
      try {
        const res = await fetch("/api/google/drive/backup");
        if (res.ok) {
          const blob = await res.blob();
          const file = new File([blob], "backup.zip", { type: "application/zip" });
          await restoreSessionGuestDataFromZipFile(file, sessionSuffix);
          restoreSuccess = true;
        }
      } catch {
        /* ignore */
      } finally {
        trackGoogleDriveRestoreCompleted(restoreSuccess);
        clearPendingDriveSync(sessionSuffix);
        const path = window.location.pathname + window.location.search;
        const u = new URL(path, window.location.origin);
        u.searchParams.delete("drive_restore");
        const next = `${u.pathname}${u.search}` || "/";
        /** Full navigation so list apps re-read localStorage (hydration already ran on first paint). */
        window.location.replace(next);
      }
    })();
  }, [isGoogleSession, searchParams, sessionSuffix]);

  if (!driveRestoreRequested) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/85 px-6 text-center backdrop-blur-sm"
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="size-9 shrink-0 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-lg font-medium text-foreground">
        {mounted ? t.apps.driveRestore.overlayTitle : ""}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {mounted ? t.apps.driveRestore.overlayDescription : ""}
      </p>
    </div>
  );
}

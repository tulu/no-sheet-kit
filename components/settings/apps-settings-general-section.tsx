"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import {
  clearGoogleCalendarIdLocal,
  readGoogleCalendarIdLocal,
  writeGoogleCalendarIdLocal,
} from "@/lib/storage/google-calendar-local";
import { getAppStorageUsage, getLastGoogleSyncAt } from "@/lib/apps/storage-usage";
import { cn } from "@/lib/utils";
import {
  trackGoogleCalendarCreated,
  trackGoogleCalendarDeleted,
} from "@/lib/analytics/events";
import { toast } from "sonner";

type SessionJson =
  | { kind: "none" | "anonymous" }
  | { kind: "google"; sub: string; email: string | null; name?: string | null };

export function AppsSettingsGeneralSection() {
  const { t, locale } = useI18n();
  const sessionSuffix = useSessionStorageSuffix();
  const [session, setSession] = useState<SessionJson | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"create" | "delete" | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [usage, setUsage] = useState<ReturnType<typeof getAppStorageUsage>>([]);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const refreshAppData = useCallback(() => {
    setUsage(getAppStorageUsage(sessionSuffix));
    setLastSyncAt(getLastGoogleSyncAt(sessionSuffix));
  }, [sessionSuffix]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/session");
      const data = (await res.json()) as SessionJson;
      setSession(data);
    })();
  }, []);

  useEffect(() => {
    if (session?.kind !== "google") {
      setCalendarId(null);
      return;
    }
    const localId = readGoogleCalendarIdLocal(session.sub);
    setCalendarId(localId);
    void (async () => {
      try {
        const res = await fetch("/api/google/calendar/setup", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as { calendarId?: string | null };
        const remoteId = typeof data.calendarId === "string" ? data.calendarId : null;
        setCalendarId(remoteId);
        if (remoteId) {
          writeGoogleCalendarIdLocal(session.sub, remoteId);
        } else {
          clearGoogleCalendarIdLocal(session.sub);
        }
      } catch {
        // Keep local fallback value if the remote check fails.
      }
    })();
  }, [session]);

  useEffect(() => {
    queueMicrotask(() => {
      refreshAppData();
    });
    const onStorage = () => refreshAppData();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshAppData();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshAppData]);

  const isGoogle = session?.kind === "google";
  const formattedSync = (() => {
    if (!lastSyncAt) return null;
    const d = new Date(lastSyncAt);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  })();

  async function onCreateCalendar() {
    if (!isGoogle || busy) return;
    setBusy("create");
    try {
      const res = await fetch("/api/google/calendar/setup", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { calendarId?: string };
      if (!res.ok || !data.calendarId) {
        toast.error(t.apps.settings.general.calendarError);
        return;
      }
      writeGoogleCalendarIdLocal(session.sub, data.calendarId);
      setCalendarId(data.calendarId);
      trackGoogleCalendarCreated();
      toast.success(t.apps.settings.general.calendarCreated);
    } finally {
      setBusy(null);
    }
  }

  async function onDeleteCalendar() {
    if (!isGoogle || busy) return;
    setBusy("delete");
    try {
      const url = new URL("/api/google/calendar/setup", window.location.origin);
      if (calendarId) url.searchParams.set("calendarId", calendarId);
      const res = await fetch(`${url.pathname}${url.search}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(t.apps.settings.general.calendarError);
        return;
      }
      clearGoogleCalendarIdLocal(session.sub);
      setCalendarId(null);
      trackGoogleCalendarDeleted();
      toast.success(t.apps.settings.general.calendarDeleted);
    } finally {
      setBusy(null);
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold text-foreground">{t.apps.settings.general.accountTitle}</h2>
        <div className="mt-2 border-b border-border" />
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{t.apps.settings.general.accountTypeLabel}</dt>
            <dd className="font-medium text-foreground">
              {isGoogle ? t.apps.settings.general.accountTypeGoogle : t.apps.settings.general.accountTypeGuest}
            </dd>
          </div>
          {isGoogle ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t.apps.settings.general.lastSyncLabel}</dt>
              <dd className="font-medium text-foreground">
                {formattedSync ?? t.apps.settings.general.lastSyncNever}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {isGoogle ? (
        <section>
          <h2 className="text-base font-semibold text-foreground">{t.apps.settings.general.calendarTitle}</h2>
          <div className="mt-2 border-b border-border" />
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {calendarId ? t.apps.settings.general.calendarReady : t.apps.settings.general.calendarMissing}
            </p>
            {calendarId ? (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 border-emerald-300/70 bg-emerald-900/90 text-emerald-50 shadow-sm"
              >
                <Check className="size-3.5" aria-hidden />
                {t.apps.settings.general.calendarStatusReady}
              </Badge>
            ) : (
              <Badge variant="outline">{t.apps.settings.general.calendarStatusMissing}</Badge>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy !== null || !!calendarId}
              onClick={() => void onCreateCalendar()}
            >
              {busy === "create"
                ? t.apps.settings.general.calendarCreateBusy
                : t.apps.settings.general.calendarCreate}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy !== null || !calendarId}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              {busy === "delete"
                ? t.apps.settings.general.calendarDeleteBusy
                : t.apps.settings.general.calendarDelete}
            </Button>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-base font-semibold text-foreground">{t.apps.settings.general.appsTitle}</h2>
        <div className="mt-2 border-b border-border" />
        <p className="mt-4 text-sm text-muted-foreground">{t.apps.settings.general.appsDescription}</p>
        <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          {usage.map((app) => (
            <li key={app.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{app.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {app.records > 0
                    ? t.apps.settings.general.appRecordsCount.replace("{count}", String(app.records))
                    : t.apps.settings.general.appNoUsage}
                </p>
              </div>
              {app.href ? (
                <Link
                  href={app.href}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
                >
                  {t.apps.settings.general.appOpen}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.apps.settings.general.calendarDeleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.apps.settings.general.calendarDeleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy !== null}>
              {t.apps.settings.general.calendarDeleteConfirmCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busy !== null}
              onClick={(event) => {
                event.preventDefault();
                void onDeleteCalendar();
              }}
            >
              {t.apps.settings.general.calendarDeleteConfirmAccept}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

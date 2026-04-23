"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { readGoogleCalendarIdLocal, writeGoogleCalendarIdLocal } from "@/lib/storage/google-calendar-local";

type SessionJson =
  | { kind: "none" | "anonymous" }
  | { kind: "google"; sub: string; email: string | null };

export function AppsSettingsGoogleCalendar() {
  const { t } = useI18n();
  const [session, setSession] = useState<SessionJson | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/auth/session");
    const j = (await res.json()) as SessionJson;
    setSession(j);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (session?.kind !== "google") return;
    setCalendarId(readGoogleCalendarIdLocal(session.sub));
  }, [session]);

  const isGoogle = session?.kind === "google";
  const sub = session?.kind === "google" ? session.sub : "";

  async function setupCalendar() {
    if (!isGoogle) return;
    setBusy("setup");
    try {
      const res = await fetch("/api/google/calendar/setup", { method: "POST" });
      const data = (await res.json()) as { calendarId?: string; error?: string };
      if (!res.ok || !data.calendarId) {
        toast.error(t.apps.settings.googleCalendar.error);
        return;
      }
      writeGoogleCalendarIdLocal(sub, data.calendarId);
      setCalendarId(data.calendarId);
    } finally {
      setBusy(null);
    }
  }

  async function createTestEvent() {
    if (!isGoogle) return;
    setBusy("create");
    try {
      const start = new Date();
      start.setHours(start.getHours() + 1, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      const res = await fetch("/api/google/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: "NoSheetKit test event",
          start: { dateTime: start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
          end: { dateTime: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        }),
      });
      const data = (await res.json()) as { id?: string };
      if (res.ok && data.id) {
        setLastEventId(data.id);
      } else {
        toast.error(t.apps.settings.googleCalendar.error);
      }
    } finally {
      setBusy(null);
    }
  }

  async function patchTestEvent() {
    if (!isGoogle || !lastEventId) return;
    setBusy("patch");
    try {
      const res = await fetch(`/api/google/calendar/events?id=${encodeURIComponent(lastEventId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: "NoSheetKit test event (updated)" }),
      });
      if (!res.ok) toast.error(t.apps.settings.googleCalendar.error);
    } finally {
      setBusy(null);
    }
  }

  async function deleteTestEvent() {
    if (!isGoogle || !lastEventId) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/google/calendar/events?id=${encodeURIComponent(lastEventId)}`, {
        method: "DELETE",
      });
      if (res.ok) setLastEventId(null);
      else toast.error(t.apps.settings.googleCalendar.error);
    } finally {
      setBusy(null);
    }
  }

  if (!session) return null;

  return (
    <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
      <div>
        <p className="text-sm font-medium text-foreground">{t.apps.settings.googleCalendar.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.apps.settings.googleCalendar.description}</p>
      </div>
      {!isGoogle ? (
        <p className="text-sm text-muted-foreground">{t.apps.settings.googleCalendar.noGoogle}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => void setupCalendar()}
          >
            {busy === "setup" ? t.apps.settings.googleCalendar.setupBusy : t.apps.settings.googleCalendar.setup}
          </Button>
          {calendarId ? (
            <p className="text-xs text-muted-foreground">{t.apps.settings.googleCalendar.setupDone}</p>
          ) : null}
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void createTestEvent()}>
              {t.apps.settings.googleCalendar.testCreate}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null || !lastEventId}
              onClick={() => void patchTestEvent()}
            >
              {t.apps.settings.googleCalendar.testEdit}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null || !lastEventId}
              onClick={() => void deleteTestEvent()}
            >
              {t.apps.settings.googleCalendar.testDelete}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

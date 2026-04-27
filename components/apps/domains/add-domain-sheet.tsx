"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NaturalDateField } from "@/components/common/natural-date-field";
import {
  GoogleCalendarEventOptions,
  type GoogleCalendarSubmitPrefs,
} from "@/components/common/google-calendar-event-options";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAppsSessionKind } from "@/lib/storage/session-storage-context";
import { defaultReminderMinutesForAppKind } from "@/lib/google/calendar-constants";
import { DOMAIN_STATUS_IDS, type DomainStatusId, type NSKDomainItem } from "@/lib/domains/schema";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

type DomainFormValues = {
  domain_name: string;
  registrar: string;
  purchased_at: string;
  expires_on: string;
  status_id: DomainStatusId;
  auto_renew: boolean;
  price: string;
  notes: string;
};

type AddDomainSheetProps = {
  open: boolean;
  editingItem: NSKDomainItem | null;
  registrarSuggestions: string[];
  onClose: () => void;
  onSubmit: (values: DomainFormValues, calendar: GoogleCalendarSubmitPrefs) => void | Promise<void>;
  onDisconnectGoogleCalendar?: () => void | Promise<void>;
};

const DEFAULT_FORM: DomainFormValues = {
  domain_name: "",
  registrar: "",
  purchased_at: "",
  expires_on: "",
  status_id: "active",
  auto_renew: false,
  price: "",
  notes: "",
};

export function AddDomainSheet({
  open,
  editingItem,
  registrarSuggestions,
  onClose,
  onSubmit,
  onDisconnectGoogleCalendar,
}: AddDomainSheetProps) {
  const { t, locale } = useI18n();
  const sessionKind = useAppsSessionKind();
  const registrarListId = useId();
  const [form, setForm] = useState<DomainFormValues>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(() =>
    defaultReminderMinutesForAppKind("domains")
  );

  const sheetTitle = editingItem ? t.domains.editDomain : t.domains.addDomain;

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (!editingItem) {
        setForm(DEFAULT_FORM);
        setAddToCalendar(false);
        setReminderMinutes(defaultReminderMinutesForAppKind("domains"));
        setError(null);
        return;
      }
      setForm({
        domain_name: editingItem.domain_name,
        registrar: editingItem.registrar,
        purchased_at: editingItem.purchased_at,
        expires_on: editingItem.expires_on,
        status_id: editingItem.status_id,
        auto_renew: editingItem.auto_renew,
        price: editingItem.price,
        notes: editingItem.notes ?? "",
      });
      setAddToCalendar(Boolean(editingItem.google_calendar_event_id));
      setReminderMinutes(
        editingItem.google_calendar_email_reminder_minutes ??
          defaultReminderMinutesForAppKind("domains")
      );
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [editingItem, open]);

  const showGoogleCalendar = sessionKind === "google" && Boolean(form.expires_on);

  async function handleSave() {
    if (isSaving) return;
    if (!form.domain_name.trim()) {
      setError(t.domains.errors.domainNameRequired);
      return;
    }
    if (!form.expires_on) {
      setError(t.domains.errors.dateRequired);
      return;
    }
    setError(null);
    const linked = Boolean(editingItem?.google_calendar_event_id);
    const calendar: GoogleCalendarSubmitPrefs = {
      enabled:
        sessionKind === "google" && Boolean(form.expires_on) && (linked || addToCalendar),
      reminderMinutes,
    };
    setIsSaving(true);
    try {
      await onSubmit(
        {
          ...form,
          domain_name: form.domain_name.trim(),
          registrar: form.registrar.trim(),
          purchased_at: form.purchased_at,
          expires_on: form.expires_on,
          price: form.price.trim(),
          notes: form.notes.trim(),
        },
        calendar
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent side="right" className="w-full p-0 sm:max-w-[460px]">
        <SheetHeader>
          <SheetTitle>{sheetTitle}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="nsk-domain-name">
              {t.domains.fields.domainName}
              {REQUIRED_MARK}
            </label>
            <Input
              id="nsk-domain-name"
              value={form.domain_name}
              onChange={(e) => setForm((prev) => ({ ...prev, domain_name: e.target.value }))}
              placeholder={t.domains.fields.domainNamePlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="nsk-domain-registrar">
              {t.domains.fields.registrar}
            </label>
            <Input
              id="nsk-domain-registrar"
              list={registrarListId}
              value={form.registrar}
              onChange={(e) => setForm((prev) => ({ ...prev, registrar: e.target.value }))}
              placeholder={t.domains.fields.registrarPlaceholder}
              autoComplete="off"
            />
            <datalist id={registrarListId}>
              {registrarSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <NaturalDateField
            locale={locale}
            label={t.domains.fields.purchasedAt}
            hint={t.domains.fields.dateHint}
            placeholder={t.domains.fields.dateNaturalPlaceholder}
            id="nsk-domain-purchased"
            valueIso={form.purchased_at}
            onChangeIso={(iso) => setForm((prev) => ({ ...prev, purchased_at: iso }))}
          />

          <NaturalDateField
            locale={locale}
            label={t.domains.fields.expiresOn}
            hint={t.domains.fields.dateHint}
            placeholder={t.domains.fields.dateNaturalPlaceholder}
            id="nsk-domain-expires"
            valueIso={form.expires_on}
            onChangeIso={(iso) => setForm((prev) => ({ ...prev, expires_on: iso }))}
            required
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t.domains.fields.status}</label>
            <Select
              value={form.status_id}
              itemToStringLabel={(value) => t.domains.types[value as DomainStatusId]}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, status_id: value as DomainStatusId }))
              }
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOMAIN_STATUS_IDS.map((statusId) => (
                  <SelectItem key={statusId} value={statusId}>
                    {t.domains.types[statusId]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">{t.domains.fields.autoRenew}</p>
              <p className="text-xs text-muted-foreground">{t.domains.fields.autoRenewHint}</p>
            </div>
            <Switch
              checked={form.auto_renew}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, auto_renew: Boolean(checked) }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="nsk-domain-price">
              {t.domains.fields.price}
            </label>
            <Input
              id="nsk-domain-price"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder={t.domains.fields.pricePlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t.domains.fields.notes}</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={t.domains.fields.notesPlaceholder}
            />
          </div>

          <GoogleCalendarEventOptions
            visible={showGoogleCalendar}
            linkedEventId={editingItem?.google_calendar_event_id}
            storedReminderMinutes={editingItem?.google_calendar_email_reminder_minutes}
            addToCalendar={addToCalendar}
            onAddToCalendarChange={setAddToCalendar}
            reminderMinutes={reminderMinutes}
            onReminderMinutesChange={setReminderMinutes}
            onRemoveFromCalendar={async () => {
              await onDisconnectGoogleCalendar?.();
            }}
            t={t}
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <SheetFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t.domains.cancel}
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {t.domains.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

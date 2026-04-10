"use client";

import { useEffect, useId, useState } from "react";
import { parseDate } from "chrono-node";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useI18n } from "@/components/providers/i18n-provider";
import { DOMAIN_STATUS_IDS, type DomainStatusId, type NSKDomainItem } from "@/lib/domains/schema";
import { getDayPickerLocale, getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";

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
  onSubmit: (values: DomainFormValues) => void;
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

function parseISODate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toISODate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(date: Date | undefined, locale: Locale): string {
  if (!date) return "";
  return date.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseDateFromInput(text: string): Date | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const parsed = parseDate(trimmed);
  if (!parsed || Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

type DateFieldBlockProps = {
  locale: Locale;
  label: string;
  hint: string;
  naturalPlaceholder: string;
  fieldId: string;
  setIso: (iso: string) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  calendarOpen: boolean;
  setCalendarOpen: (v: boolean) => void;
  resolvedDate: Date | undefined;
  required?: boolean;
};

function DateFieldBlock({
  locale,
  label,
  hint,
  naturalPlaceholder,
  fieldId,
  setIso,
  inputValue,
  setInputValue,
  calendarOpen,
  setCalendarOpen,
  resolvedDate,
  required = false,
}: DateFieldBlockProps) {
  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={fieldId}>
        {label}
        {required ? REQUIRED_MARK : null}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={fieldId}
          value={inputValue}
          placeholder={naturalPlaceholder}
          onChange={(e) => {
            const v = e.target.value;
            setInputValue(v);
            const d = parseDateFromInput(v);
            if (d) {
              setIso(toISODate(d));
            } else if (!v.trim()) {
              setIso("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCalendarOpen(true);
            }
          }}
        />
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger nativeButton={false} render={<InputGroupAddon align="inline-end" />}>
            <InputGroupButton variant="ghost" size="icon-xs" aria-label={label}>
              <CalendarIcon className="size-4" />
              <span className="sr-only">{label}</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
            sideOffset={8}
            initialFocus={false}
          >
              {calendarOpen ? (
                <Calendar
                  mode="single"
                  locale={getDayPickerLocale(locale)}
                  selected={resolvedDate}
                  defaultMonth={resolvedDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    if (!date) return;
                    setIso(toISODate(date));
                    setInputValue(formatDateDisplay(date, locale));
                    setCalendarOpen(false);
                  }}
                />
              ) : null}
          </PopoverContent>
        </Popover>
      </InputGroup>
      <FieldDescription>{hint}</FieldDescription>
    </Field>
  );
}

export function AddDomainSheet({
  open,
  editingItem,
  registrarSuggestions,
  onClose,
  onSubmit,
}: AddDomainSheetProps) {
  const { t, locale } = useI18n();
  const registrarListId = useId();
  const [form, setForm] = useState<DomainFormValues>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  const [purchasedInput, setPurchasedInput] = useState("");
  const [purchasedCalendarOpen, setPurchasedCalendarOpen] = useState(false);

  const [expiresInput, setExpiresInput] = useState("");
  const [expiresCalendarOpen, setExpiresCalendarOpen] = useState(false);

  const sheetTitle = editingItem ? t.domains.editDomain : t.domains.addDomain;
  const resolvedPurchased =
    parseDateFromInput(purchasedInput) ?? parseISODate(form.purchased_at);
  const resolvedExpires =
    parseDateFromInput(expiresInput) ?? parseISODate(form.expires_on);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (!editingItem) {
        setForm(DEFAULT_FORM);
        setPurchasedInput("");
        setExpiresInput("");
        setPurchasedCalendarOpen(false);
        setExpiresCalendarOpen(false);
        setError(null);
        return;
      }
      const p = parseISODate(editingItem.purchased_at);
      const e = parseISODate(editingItem.expires_on);
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
      setPurchasedInput(p ? formatDateDisplay(p, locale) : editingItem.purchased_at);
      setExpiresInput(e ? formatDateDisplay(e, locale) : editingItem.expires_on);
      setPurchasedCalendarOpen(false);
      setExpiresCalendarOpen(false);
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [editingItem, locale, open]);

  function handleSave() {
    if (!form.domain_name.trim()) {
      setError(t.domains.errors.domainNameRequired);
      return;
    }
    const purchased =
      parseDateFromInput(purchasedInput) ??
      (form.purchased_at ? parseISODate(form.purchased_at) : undefined);
    const expires =
      parseDateFromInput(expiresInput) ??
      (form.expires_on ? parseISODate(form.expires_on) : undefined);
    if (!expires) {
      setError(t.domains.errors.dateRequired);
      return;
    }
    setError(null);
    onSubmit({
      ...form,
      domain_name: form.domain_name.trim(),
      registrar: form.registrar.trim(),
      purchased_at: purchased ? toISODate(purchased) : "",
      expires_on: toISODate(expires),
      price: form.price.trim(),
      notes: form.notes.trim(),
    });
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

          <DateFieldBlock
            locale={locale}
            label={t.domains.fields.purchasedAt}
            hint={t.domains.fields.dateHint}
            naturalPlaceholder={t.domains.fields.dateNaturalPlaceholder}
            fieldId="nsk-domain-purchased"
            setIso={(iso) => setForm((prev) => ({ ...prev, purchased_at: iso }))}
            inputValue={purchasedInput}
            setInputValue={setPurchasedInput}
            calendarOpen={purchasedCalendarOpen}
            setCalendarOpen={setPurchasedCalendarOpen}
            resolvedDate={resolvedPurchased}
          />

          <DateFieldBlock
            locale={locale}
            label={t.domains.fields.expiresOn}
            hint={t.domains.fields.dateHint}
            naturalPlaceholder={t.domains.fields.dateNaturalPlaceholder}
            fieldId="nsk-domain-expires"
            setIso={(iso) => setForm((prev) => ({ ...prev, expires_on: iso }))}
            inputValue={expiresInput}
            setInputValue={setExpiresInput}
            calendarOpen={expiresCalendarOpen}
            setCalendarOpen={setExpiresCalendarOpen}
            resolvedDate={resolvedExpires}
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

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <SheetFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t.domains.cancel}
          </Button>
          <Button onClick={handleSave}>{t.domains.save}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

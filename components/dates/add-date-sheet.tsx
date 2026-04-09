"use client";

import { useEffect, useState } from "react";
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
import { DATE_TYPE_IDS, type DateTypeId, type NSKDateItem } from "@/lib/dates/schema";
import { getDayPickerLocale, getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";

type DateFormValues = {
  label: string;
  type_id: DateTypeId;
  date: string;
  is_recurring: boolean;
  notes: string;
};

type AddDateSheetProps = {
  open: boolean;
  editingItem: NSKDateItem | null;
  onClose: () => void;
  onSubmit: (values: DateFormValues) => void;
};

const DEFAULT_FORM: DateFormValues = {
  label: "",
  type_id: "birthday",
  date: "",
  is_recurring: false,
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

export function AddDateSheet({ open, editingItem, onClose, onSubmit }: AddDateSheetProps) {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<DateFormValues>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(undefined);

  const sheetTitle = editingItem ? t.dates.editDate : t.dates.addDate;
  const resolvedDate = parseDateFromInput(dateInput) ?? parseISODate(form.date);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (!editingItem) {
        setForm(DEFAULT_FORM);
        setDateInput("");
        setMonth(undefined);
        setCalendarOpen(false);
        setError(null);
        return;
      }
      const fromIso = parseISODate(editingItem.date);
      setForm({
        label: editingItem.label,
        type_id: editingItem.type_id,
        date: editingItem.date,
        is_recurring: editingItem.is_recurring,
        notes: editingItem.notes ?? "",
      });
      setDateInput(
        fromIso ? formatDateDisplay(fromIso, locale) : editingItem.date
      );
      setMonth(fromIso ?? new Date());
      setCalendarOpen(false);
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [editingItem, locale, open]);

  function handleSave() {
    if (!form.label.trim()) {
      setError(t.dates.errors.labelRequired);
      return;
    }
    const parsed =
      parseDateFromInput(dateInput) ?? (form.date ? parseISODate(form.date) : undefined);
    if (!parsed) {
      setError(t.dates.errors.dateRequired);
      return;
    }
    const iso = toISODate(parsed);
    setError(null);
    onSubmit({
      ...form,
      label: form.label.trim(),
      notes: form.notes.trim(),
      date: iso,
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-[460px] p-0">
        <SheetHeader>
          <SheetTitle>{sheetTitle}</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t.dates.fields.label}</label>
            <Input
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder={t.dates.fields.labelPlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t.dates.fields.type}</label>
            <Select
              value={form.type_id}
              itemToStringLabel={(value) => t.dates.types[value as DateTypeId]}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, type_id: value as DateTypeId }))
              }
            >
              <SelectTrigger className="w-full h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_TYPE_IDS.map((typeId) => (
                  <SelectItem key={typeId} value={typeId}>
                    {t.dates.types[typeId]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="nsk-dates-natural-date">{t.dates.fields.date}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nsk-dates-natural-date"
                value={dateInput}
                placeholder={t.dates.fields.dateNaturalPlaceholder}
                onChange={(e) => {
                  const v = e.target.value;
                  setDateInput(v);
                  const d = parseDateFromInput(v);
                  if (d) {
                    setForm((prev) => ({ ...prev, date: toISODate(d) }));
                    setMonth(d);
                  } else if (!v.trim()) {
                    setForm((prev) => ({ ...prev, date: "" }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCalendarOpen(true);
                  }
                }}
              />
              <InputGroupAddon align="inline-end">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <InputGroupButton
                        id="nsk-dates-calendar-trigger"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={t.dates.fields.date}
                      />
                    }
                  >
                    <CalendarIcon className="size-4" />
                    <span className="sr-only">{t.dates.fields.date}</span>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    sideOffset={8}
                  >
                    <Calendar
                      mode="single"
                      locale={getDayPickerLocale(locale)}
                      selected={resolvedDate}
                      month={month}
                      onMonthChange={setMonth}
                      captionLayout="dropdown"
                      defaultMonth={resolvedDate ?? month}
                      onSelect={(date) => {
                        if (!date) return;
                        setForm((prev) => ({ ...prev, date: toISODate(date) }));
                        setDateInput(formatDateDisplay(date, locale));
                        setMonth(date);
                        setCalendarOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>{t.dates.fields.dateHint}</FieldDescription>
          </Field>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">{t.dates.fields.recurring}</p>
              <p className="text-xs text-muted-foreground">{t.dates.fields.recurringHint}</p>
            </div>
            <Switch
              checked={form.is_recurring}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, is_recurring: Boolean(checked) }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t.dates.fields.notes}</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={t.dates.fields.notesPlaceholder}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <SheetFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t.dates.cancel}
          </Button>
          <Button onClick={handleSave}>{t.dates.save}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useEffect, useState } from "react";
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
import { useI18n } from "@/components/providers/i18n-provider";
import { DATE_TYPE_IDS, type DateTypeId, type NSKDateItem } from "@/lib/dates/schema";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

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

export function AddDateSheet({ open, editingItem, onClose, onSubmit }: AddDateSheetProps) {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<DateFormValues>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  const sheetTitle = editingItem ? t.dates.editDate : t.dates.addDate;

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (!editingItem) {
        setForm(DEFAULT_FORM);
        setError(null);
        return;
      }
      setForm({
        label: editingItem.label,
        type_id: editingItem.type_id,
        date: editingItem.date,
        is_recurring: editingItem.is_recurring,
        notes: editingItem.notes ?? "",
      });
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [editingItem, open]);

  function handleSave() {
    if (!form.label.trim()) {
      setError(t.dates.errors.labelRequired);
      return;
    }
    if (!form.date) {
      setError(t.dates.errors.dateRequired);
      return;
    }
    setError(null);
    onSubmit({
      ...form,
      label: form.label.trim(),
      notes: form.notes.trim(),
      date: form.date,
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
            <label className="text-sm font-medium text-foreground" htmlFor="nsk-dates-label">
              {t.dates.fields.label}
              {REQUIRED_MARK}
            </label>
            <Input
              id="nsk-dates-label"
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

          <NaturalDateField
            id="nsk-dates-natural-date"
            locale={locale}
            label={t.dates.fields.date}
            hint={t.dates.fields.dateHint}
            placeholder={t.dates.fields.dateNaturalPlaceholder}
            valueIso={form.date}
            onChangeIso={(iso) => setForm((prev) => ({ ...prev, date: iso }))}
            required
          />

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

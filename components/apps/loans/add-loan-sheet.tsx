"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useI18n } from "@/components/providers/i18n-provider";
import type { LoanDirection, NSKLoanItem } from "@/lib/loans/schema";
import { parseAmount } from "@/lib/loans/loans-helpers";
import { cn } from "@/lib/utils";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

type LoanFormValues = {
  direction: LoanDirection;
  counterparty_name: string;
  currency: string;
  amount: string;
  date: string;
  notes: string;
};

type AddLoanSheetProps = {
  open: boolean;
  editingItem: NSKLoanItem | null;
  onClose: () => void;
  onSubmit: (values: LoanFormValues) => void;
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const EMPTY_FORM: LoanFormValues = {
  direction: "lent",
  counterparty_name: "",
  currency: "USD",
  amount: "",
  date: todayIso(),
  notes: "",
};

function itemToForm(item: NSKLoanItem): LoanFormValues {
  return {
    direction: item.direction,
    counterparty_name: item.counterparty_name,
    currency: item.currency.trim() || "USD",
    amount: item.amount,
    date: item.date,
    notes: item.notes ?? "",
  };
}

export function AddLoanSheet({ open, editingItem, onClose, onSubmit }: AddLoanSheetProps) {
  const { t } = useI18n();
  const baseId = useId();
  const [form, setForm] = useState<LoanFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof LoanFormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingItem) {
        setForm(itemToForm(editingItem));
      } else {
        setForm({ ...EMPTY_FORM, date: todayIso() });
      }
      setErrors({});
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingItem]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof LoanFormValues, string>> = {};
    if (!form.counterparty_name.trim()) {
      nextErrors.counterparty_name = t.loans.errors.counterpartyRequired;
    }
    if (!form.date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(form.date.trim())) {
      nextErrors.date = t.loans.errors.loanDateRequired;
    }
    if (!form.amount.trim() || parseAmount(form.amount) <= 0) {
      nextErrors.amount = t.loans.errors.amountRequired;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      ...form,
      counterparty_name: form.counterparty_name.trim(),
      currency: (form.currency.trim() || "USD").toUpperCase(),
      amount: form.amount.trim(),
      date: form.date.trim(),
      notes: form.notes.trim(),
    });
  }

  const title = editingItem ? t.loans.editLoan : t.loans.addLoan;
  const directionGroupId = `${baseId}-direction-group`;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <Field>
            <FieldLabel id={`${baseId}-direction-label`}>{t.loans.fields.direction}</FieldLabel>
            <div
              id={directionGroupId}
              role="radiogroup"
              aria-labelledby={`${baseId}-direction-label`}
              className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-3"
            >
              {(["lent", "borrowed"] as const).map((dir) => (
                <label
                  key={dir}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    form.direction === dir
                      ? "border-primary bg-primary/5 font-medium text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name={`${baseId}-direction`}
                    value={dir}
                    checked={form.direction === dir}
                    onChange={() => setForm((f) => ({ ...f, direction: dir }))}
                    className="size-4 shrink-0 accent-primary"
                  />
                  {dir === "lent" ? t.loans.directionLent : t.loans.directionBorrowed}
                </label>
              ))}
            </div>
          </Field>

          <Field data-invalid={errors.counterparty_name ? true : undefined}>
            <FieldLabel htmlFor={`${baseId}-counterparty`}>
              {t.loans.fields.counterparty}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-counterparty`}
              value={form.counterparty_name}
              onChange={(e) => setForm((f) => ({ ...f, counterparty_name: e.target.value }))}
              placeholder={t.loans.fields.counterpartyPlaceholder}
              autoComplete="name"
            />
            {errors.counterparty_name ? (
              <FieldDescription className="text-destructive">{errors.counterparty_name}</FieldDescription>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor={`${baseId}-currency`}>{t.loans.fields.currency}</FieldLabel>
            <Input
              id={`${baseId}-currency`}
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              placeholder={t.loans.fields.currencyPlaceholder}
              autoCapitalize="characters"
            />
          </Field>

          <Field data-invalid={errors.amount ? true : undefined}>
            <FieldLabel htmlFor={`${baseId}-amount`}>
              {t.loans.fields.amount}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-amount`}
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder={t.loans.fields.amountPlaceholder}
            />
            {errors.amount ? (
              <FieldDescription className="text-destructive">{errors.amount}</FieldDescription>
            ) : null}
          </Field>

          <Field data-invalid={errors.date ? true : undefined}>
            <FieldLabel htmlFor={`${baseId}-loan-date`}>
              {t.loans.fields.date}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-loan-date`}
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            {errors.date ? (
              <FieldDescription className="text-destructive">{errors.date}</FieldDescription>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor={`${baseId}-notes`}>{t.loans.fields.notes}</FieldLabel>
            <Textarea
              id={`${baseId}-notes`}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder={t.loans.fields.notesPlaceholder}
              rows={3}
            />
          </Field>

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.loans.cancel}
            </Button>
            <Button type="submit">{t.loans.save}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { useI18n } from "@/components/providers/i18n-provider";
import { parseAmount } from "@/lib/loans/loans-helpers";
import type { NSKEventExpense } from "@/lib/events/schema";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

type AddExpenseSheetProps = {
  open: boolean;
  editingExpense: NSKEventExpense | null;
  onClose: () => void;
  onSubmit: (values: { name: string; total_amount: string; currency: string }) => void;
};

export function AddExpenseSheet({
  open,
  editingExpense,
  onClose,
  onSubmit,
}: AddExpenseSheetProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingExpense) {
        setName(editingExpense.name);
        setTotal(editingExpense.total_amount);
        setCurrency(editingExpense.currency.trim() || "USD");
      } else {
        setName("");
        setTotal("");
        setCurrency("USD");
      }
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingExpense]);

  function handleSubmit() {
    if (!name.trim()) {
      setError(t.events.errors.expenseNameRequired);
      return;
    }
    if (parseAmount(total) <= 0) {
      setError(t.events.errors.expenseTotalRequired);
      return;
    }
    onSubmit({
      name: name.trim(),
      total_amount: total.trim(),
      currency: (currency.trim() || "USD").toUpperCase(),
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {editingExpense ? t.events.expenses.editExpense : t.events.expenses.addExpense}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-4">
          <Field>
            <FieldLabel>
              {t.events.fields.expenseName}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={t.events.fields.expenseNamePlaceholder}
            />
          </Field>
          <Field>
            <FieldLabel>
              {t.events.fields.expenseTotal}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              value={total}
              onChange={(e) => {
                setTotal(e.target.value);
                setError(null);
              }}
              placeholder={t.events.fields.expenseTotalPlaceholder}
              inputMode="decimal"
            />
          </Field>
          <Field>
            <FieldLabel>{t.events.fields.expenseCurrency}</FieldLabel>
            <Input
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setError(null);
              }}
              placeholder={t.events.fields.expenseCurrencyPlaceholder}
              autoCapitalize="characters"
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.events.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t.events.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

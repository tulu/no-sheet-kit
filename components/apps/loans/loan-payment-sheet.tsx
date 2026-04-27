"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { NaturalDateField } from "@/components/common/natural-date-field";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKLoanItem } from "@/lib/loans/schema";
import {
  formatAmount,
  formatLoanNumber,
  outstandingBalance,
  parseAmount,
} from "@/lib/loans/loans-helpers";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type LoanPaymentSheetProps = {
  open: boolean;
  loan: NSKLoanItem | null;
  onClose: () => void;
  onSubmit: (amount: string, date: string) => void;
};

export function LoanPaymentSheet({ open, loan, onClose, onSubmit }: LoanPaymentSheetProps) {
  const { locale, t } = useI18n();
  const baseId = useId();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);
  const [payFullRemaining, setPayFullRemaining] = useState(false);

  useEffect(() => {
    if (!open || !loan) return;
    const id = requestAnimationFrame(() => {
      setDate(todayIso());
      setAmount("");
      setError(null);
      setPayFullRemaining(false);
    });
    return () => cancelAnimationFrame(id);
  }, [open, loan?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- reset when opening or switching loan

  useEffect(() => {
    if (!open || !loan || !payFullRemaining) return;
    const id = requestAnimationFrame(() => {
      setAmount(formatLoanNumber(outstandingBalance(loan), locale));
    });
    return () => cancelAnimationFrame(id);
  }, [open, loan, payFullRemaining, locale]);

  if (!loan) return null;

  const outstanding = outstandingBalance(loan);

  function setPayFull(next: boolean) {
    setPayFullRemaining(next);
    setError(null);
    if (!next) {
      setAmount("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      setError(t.loans.errors.dateRequired);
      return;
    }
    if (payFullRemaining) {
      if (outstanding <= 0.009) {
        setError(t.loans.errors.amountInvalid);
        return;
      }
      setError(null);
      onSubmit(formatAmount(outstanding), date.trim());
      return;
    }
    if (!amount.trim()) {
      setError(t.loans.errors.amountRequired);
      return;
    }
    const parsed = parseAmount(amount);
    if (parsed <= 0) {
      setError(t.loans.errors.amountInvalid);
      return;
    }
    if (parsed > outstanding + 0.009) {
      setError(t.loans.errors.amountExceedsOutstanding);
      return;
    }
    setError(null);
    onSubmit(amount.trim().replace(",", "."), date.trim());
  }

  const settleFullId = `${baseId}-settle-full`;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t.loans.paymentAddTitle}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{loan.counterparty_name}</span>
            {" · "}
            {loan.currency.trim().toUpperCase() || "—"}
          </p>

          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={`${baseId}-amount`}>
              {t.loans.paymentAmount}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-amount`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
                if (payFullRemaining) setPayFullRemaining(false);
              }}
              readOnly={payFullRemaining}
              aria-readonly={payFullRemaining}
              className={payFullRemaining ? "bg-muted" : undefined}
            />
            <div className="mt-2 flex items-start gap-2">
              <input
                id={settleFullId}
                type="checkbox"
                checked={payFullRemaining}
                onChange={(e) => setPayFull(e.target.checked)}
                className="mt-1 size-4 shrink-0 rounded border border-input accent-primary"
              />
              <label htmlFor={settleFullId} className="cursor-pointer text-sm leading-snug text-muted-foreground">
                {t.loans.paymentSettleFullLabel}
              </label>
            </div>
            {error ? <FieldDescription className="text-destructive">{error}</FieldDescription> : null}
          </Field>

          <NaturalDateField
            id={`${baseId}-date`}
            locale={locale}
            label={t.loans.paymentDate}
            hint={t.loans.fields.dateHint}
            placeholder={t.loans.fields.dateNaturalPlaceholder}
            valueIso={date}
            onChangeIso={(iso) => {
              setDate(iso);
              setError(null);
            }}
            required
          />

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.loans.cancel}
            </Button>
            <Button type="submit">{t.loans.paymentSubmitAdd}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useEffect, useId, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import type { LoanPayment, NSKLoanItem } from "@/lib/loans/schema";
import {
  formatAmount,
  formatLoanNumber,
  maxAdditionalPayment,
  parseAmount,
} from "@/lib/loans/loans-helpers";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import { ConfirmDeleteAlertDialog } from "@/components/common/confirm-delete-alert-dialog";
import { NaturalDateField } from "@/components/common/natural-date-field";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AMOUNT_EPSILON = 0.009;

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateShort(iso: string, localeTag: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.trim() ? iso : "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(localeTag, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type LoanPaymentsSheetProps = {
  open: boolean;
  loan: NSKLoanItem | null;
  onClose: () => void;
  onUpdatePayments: (loanId: string, payments: LoanPayment[]) => void;
};

export function LoanPaymentsSheet({ open, loan, onClose, onUpdatePayments }: LoanPaymentsSheetProps) {
  const { locale, t } = useI18n();
  const baseId = useId();
  const localeTag = getIntlLocaleTag(locale);

  const [draftDate, setDraftDate] = useState(todayIso());
  const [draftAmount, setDraftAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentPendingDelete, setPaymentPendingDelete] = useState<LoanPayment | null>(null);
  const [payFullRemaining, setPayFullRemaining] = useState(false);

  const sortedPayments = (() => {
    if (!loan) return [];
    return [...loan.payments].sort((a, b) => b.date.localeCompare(a.date));
  })();

  useEffect(() => {
    if (!open || !loan) return;
    const id = requestAnimationFrame(() => {
      setDraftDate(todayIso());
      setDraftAmount("");
      setEditingId(null);
      setFormError(null);
      setPaymentPendingDelete(null);
      setPayFullRemaining(false);
    });
    return () => cancelAnimationFrame(id);
    // Intentionally only when opening or switching loans — do not reset while `loan.payments` updates in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loan?.id + open
  }, [open, loan?.id]);

  const maxExtra = loan ? maxAdditionalPayment(loan, editingId) : 0;

  useEffect(() => {
    if (!open || !loan || !payFullRemaining) return;
    const id = requestAnimationFrame(() => {
      const max = maxAdditionalPayment(loan, editingId);
      if (max > AMOUNT_EPSILON) {
        setDraftAmount(formatLoanNumber(max, locale));
      }
    });
    return () => cancelAnimationFrame(id);
  }, [open, loan, editingId, payFullRemaining, locale]);

  function resetDraft() {
    setDraftDate(todayIso());
    setDraftAmount("");
    setEditingId(null);
    setFormError(null);
    setPayFullRemaining(false);
  }

  function startEdit(p: LoanPayment) {
    setEditingId(p.id);
    setDraftDate(p.date);
    setDraftAmount(p.amount.trim());
    setFormError(null);
    setPayFullRemaining(false);
  }

  function setPayFull(next: boolean) {
    setPayFullRemaining(next);
    setFormError(null);
    if (!next) {
      setDraftAmount("");
    }
  }

  function persist(next: LoanPayment[]) {
    if (!loan) return;
    onUpdatePayments(loan.id, next);
  }

  function validateDraft(): { amountStr: string; dateStr: string } | null {
    if (!loan) return null;
    if (!draftDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(draftDate.trim())) {
      setFormError(t.loans.errors.dateRequired);
      return null;
    }
    const max = maxAdditionalPayment(loan, editingId);
    if (payFullRemaining) {
      if (max <= AMOUNT_EPSILON) {
        setFormError(t.loans.errors.amountInvalid);
        return null;
      }
      setFormError(null);
      return { amountStr: formatAmount(max), dateStr: draftDate.trim() };
    }
    if (!draftAmount.trim()) {
      setFormError(t.loans.errors.amountRequired);
      return null;
    }
    const parsed = parseAmount(draftAmount);
    if (parsed <= 0) {
      setFormError(t.loans.errors.amountInvalid);
      return null;
    }
    if (parsed > max + AMOUNT_EPSILON) {
      setFormError(t.loans.errors.amountExceedsOutstanding);
      return null;
    }
    setFormError(null);
    const amountStr = formatAmount(parsed);
    return { amountStr, dateStr: draftDate.trim() };
  }

  function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!loan) return;
    const ok = validateDraft();
    if (!ok) return;
    const next: LoanPayment = {
      id: crypto.randomUUID(),
      amount: ok.amountStr,
      date: ok.dateStr,
    };
    persist([...loan.payments, next]);
    resetDraft();
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!loan || !editingId) return;
    const ok = validateDraft();
    if (!ok) return;
    persist(
      loan.payments.map((p) =>
        p.id === editingId ? { ...p, amount: ok.amountStr, date: ok.dateStr } : p
      )
    );
    resetDraft();
  }

  function handleConfirmDeletePayment() {
    if (!loan || !paymentPendingDelete) return;
    persist(loan.payments.filter((p) => p.id !== paymentPendingDelete.id));
    setPaymentPendingDelete(null);
    if (editingId === paymentPendingDelete.id) resetDraft();
  }

  const canAddMore = maxExtra > AMOUNT_EPSILON;
  const settleFullId = `${baseId}-settle-full`;

  if (!loan) return null;

  const deleteLabel =
    paymentPendingDelete != null
      ? `${formatLoanNumber(parseAmount(paymentPendingDelete.amount), locale)} · ${formatDateShort(paymentPendingDelete.date, localeTag)}`
      : "";

  return (
    <>
      <ConfirmDeleteAlertDialog
        open={paymentPendingDelete != null}
        onOpenChange={(next) => {
          if (!next) setPaymentPendingDelete(null);
        }}
        title={t.loans.deletePaymentDialogTitle}
        description={t.loans.deletePaymentDialogDescription}
        itemLabel={deleteLabel || null}
        cancelLabel={t.loans.deleteDialogCancel}
        confirmLabel={t.loans.deleteDialogConfirm}
        onConfirm={handleConfirmDeletePayment}
      />

      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent side="right" className="flex w-full max-w-lg flex-col gap-0 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{t.loans.paymentListSheetTitle}</SheetTitle>
            <p className="text-sm text-muted-foreground">
              {loan.counterparty_name}
              {" · "}
              {loan.currency.trim().toUpperCase() || "—"}
            </p>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pb-4">
            <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                    <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.loans.paymentListDate}
                    </TableHead>
                    <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.loans.paymentListAmount}
                    </TableHead>
                    <TableHead className="w-24 px-2 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.loans.paymentListActions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="px-3 py-2 text-muted-foreground">
                        {formatDateShort(p.date, localeTag)}
                      </TableCell>
                      <TableCell className="px-3 py-2 tabular-nums font-medium text-foreground">
                        {formatLoanNumber(parseAmount(p.amount), locale)}
                      </TableCell>
                      <TableCell className="px-2 py-1 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-8"
                            aria-label={t.loans.edit}
                            onClick={() => startEdit(p)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-8 text-destructive hover:text-destructive"
                            aria-label={t.loans.delete}
                            onClick={() => setPaymentPendingDelete(p)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="shrink-0 border-t border-border pt-4">
              {!canAddMore && !editingId ? (
                <p className="mb-3 text-sm text-muted-foreground">{t.loans.paymentListFullyPaidHint}</p>
              ) : null}

              <form
                onSubmit={editingId ? handleSaveEdit : handleSubmitNew}
                className="flex flex-col gap-3"
              >
                <NaturalDateField
                  id={`${baseId}-date`}
                  locale={locale}
                  label={t.loans.paymentDate}
                  hint={t.loans.fields.dateHint}
                  placeholder={t.loans.fields.dateNaturalPlaceholder}
                  valueIso={draftDate}
                  onChangeIso={(iso) => {
                    setDraftDate(iso);
                    setFormError(null);
                  }}
                  disabled={!editingId && !canAddMore}
                />
                <Field data-invalid={formError ? true : undefined}>
                  <FieldLabel htmlFor={`${baseId}-amount`}>{t.loans.paymentAmount}</FieldLabel>
                  <Input
                    id={`${baseId}-amount`}
                    inputMode="decimal"
                    value={draftAmount}
                    onChange={(e) => {
                      setDraftAmount(e.target.value);
                      setFormError(null);
                      if (payFullRemaining) setPayFullRemaining(false);
                    }}
                    readOnly={payFullRemaining}
                    aria-readonly={payFullRemaining}
                    className={payFullRemaining ? "bg-muted" : undefined}
                    disabled={!editingId && !canAddMore}
                  />
                  {(canAddMore || editingId) && maxExtra > AMOUNT_EPSILON ? (
                    <div className="mt-2 flex items-start gap-2">
                      <input
                        id={settleFullId}
                        type="checkbox"
                        checked={payFullRemaining}
                        onChange={(e) => setPayFull(e.target.checked)}
                        disabled={!editingId && !canAddMore}
                        className="mt-1 size-4 shrink-0 rounded border border-input accent-primary"
                      />
                      <label
                        htmlFor={settleFullId}
                        className="cursor-pointer text-sm leading-snug text-muted-foreground"
                      >
                        {t.loans.paymentSettleFullLabel}
                      </label>
                    </div>
                  ) : null}
                  {canAddMore || editingId ? (
                    <FieldDescription>
                      {t.loans.paymentListMaxHint.replace(
                        "{amount}",
                        formatLoanNumber(maxExtra, locale)
                      )}
                    </FieldDescription>
                  ) : null}
                  {formError ? (
                    <FieldDescription className="text-destructive">{formError}</FieldDescription>
                  ) : null}
                </Field>

                <SheetFooter className="flex-row flex-wrap justify-end gap-2 border-0 p-0 sm:flex-row">
                  {editingId ? (
                    <>
                      <Button type="button" variant="outline" onClick={resetDraft}>
                        {t.loans.paymentListCancelEdit}
                      </Button>
                      <Button type="submit">{t.loans.paymentListSaveEdit}</Button>
                    </>
                  ) : (
                    <Button type="submit" disabled={!canAddMore}>
                      {t.loans.paymentListSaveNew}
                    </Button>
                  )}
                </SheetFooter>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

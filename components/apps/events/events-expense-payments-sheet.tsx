"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKEventExpense, NSKEventPayment } from "@/lib/events/schema";
import { expenseCurrency, maxAdditionalExpensePayment } from "@/lib/events/events-helpers";
import {
  formatAmount,
  formatLoanNumber,
  parseAmount,
} from "@/lib/loans/loans-helpers";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import { ConfirmDeleteAlertDialog } from "@/components/common/confirm-delete-alert-dialog";
import { NaturalDateField } from "@/components/common/natural-date-field";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export type ExpensePaymentsSheetProps = {
  open: boolean;
  expense: NSKEventExpense | null;
  onClose: () => void;
  onUpdatePayments: (expenseId: string, payments: NSKEventPayment[]) => void;
};

export function ExpensePaymentsSheet({
  open,
  expense,
  onClose,
  onUpdatePayments,
}: ExpensePaymentsSheetProps) {
  const { locale, t } = useI18n();
  const baseId = useId();
  const localeTag = getIntlLocaleTag(locale);

  const [draftDate, setDraftDate] = useState(todayIso());
  const [draftAmount, setDraftAmount] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentPendingDelete, setPaymentPendingDelete] = useState<NSKEventPayment | null>(null);
  const [payFullRemaining, setPayFullRemaining] = useState(false);
  const suppressSubmitRef = useRef(false);

  const sortedPayments = (() => {
    if (!expense) return [];
    return [...expense.payments].sort((a, b) => b.date.localeCompare(a.date));
  })();

  useEffect(() => {
    if (!open || !expense) return;
    const id = requestAnimationFrame(() => {
      setDraftDate(todayIso());
      setDraftAmount("");
      setDraftNote("");
      setEditingId(null);
      setFormError(null);
      setPaymentPendingDelete(null);
      setPayFullRemaining(false);
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- expense?.id + open
  }, [open, expense?.id]);

  const maxExtra = expense ? maxAdditionalExpensePayment(expense, editingId) : 0;

  useEffect(() => {
    if (!open || !expense || !payFullRemaining) return;
    const id = requestAnimationFrame(() => {
      const max = maxAdditionalExpensePayment(expense, editingId);
      if (max > AMOUNT_EPSILON) {
        setDraftAmount(formatLoanNumber(max, locale));
      }
    });
    return () => cancelAnimationFrame(id);
  }, [open, expense, editingId, payFullRemaining, locale]);

  function resetDraft() {
    setDraftDate(todayIso());
    setDraftAmount("");
    setDraftNote("");
    setEditingId(null);
    setFormError(null);
    setPayFullRemaining(false);
  }

  function handleCancelEdit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    suppressSubmitRef.current = true;
    resetDraft();
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (suppressSubmitRef.current) {
      suppressSubmitRef.current = false;
      return;
    }
    if (editingId) handleSaveEdit();
    else handleSubmitNew();
  }

  function startEdit(payment: NSKEventPayment) {
    setEditingId(payment.id);
    setDraftDate(payment.date);
    setDraftAmount(payment.amount.trim());
    setDraftNote(payment.note?.trim() ?? "");
    setFormError(null);
    setPayFullRemaining(false);
  }

  function setPayFull(next: boolean) {
    setPayFullRemaining(next);
    setFormError(null);
    if (!next) setDraftAmount("");
  }

  function persist(next: NSKEventPayment[]) {
    if (!expense) return;
    onUpdatePayments(expense.id, next);
  }

  function validateDraft(): { amountStr: string; dateStr: string; note?: string } | null {
    if (!expense) return null;
    if (!draftDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(draftDate.trim())) {
      setFormError(t.events.errors.paymentDateRequired);
      return null;
    }
    const max = maxAdditionalExpensePayment(expense, editingId);
    if (payFullRemaining) {
      if (max <= AMOUNT_EPSILON) {
        setFormError(t.events.errors.paymentAmountRequired);
        return null;
      }
      setFormError(null);
      return {
        amountStr: formatAmount(max),
        dateStr: draftDate.trim(),
        note: draftNote.trim() || undefined,
      };
    }
    if (!draftAmount.trim()) {
      setFormError(t.events.errors.paymentAmountRequired);
      return null;
    }
    const parsed = parseAmount(draftAmount);
    if (parsed <= 0) {
      setFormError(t.events.errors.paymentAmountRequired);
      return null;
    }
    if (parsed > max + AMOUNT_EPSILON) {
      setFormError(t.events.errors.paymentExceedsTotal);
      return null;
    }
    setFormError(null);
    return {
      amountStr: formatAmount(parsed),
      dateStr: draftDate.trim(),
      note: draftNote.trim() || undefined,
    };
  }

  function handleSubmitNew() {
    if (!expense) return;
    const ok = validateDraft();
    if (!ok) return;
    const next: NSKEventPayment = {
      id: crypto.randomUUID(),
      amount: ok.amountStr,
      date: ok.dateStr,
      note: ok.note,
    };
    persist([...expense.payments, next]);
    resetDraft();
  }

  function handleSaveEdit() {
    if (!expense || !editingId) return;
    const ok = validateDraft();
    if (!ok) return;
    persist(
      expense.payments.map((p) =>
        p.id === editingId
          ? { ...p, amount: ok.amountStr, date: ok.dateStr, note: ok.note }
          : p
      )
    );
    resetDraft();
  }

  function handleConfirmDeletePayment() {
    if (!expense || !paymentPendingDelete) return;
    persist(expense.payments.filter((p) => p.id !== paymentPendingDelete.id));
    setPaymentPendingDelete(null);
    if (editingId === paymentPendingDelete.id) resetDraft();
  }

  const canAddMore = maxExtra > AMOUNT_EPSILON;
  const settleFullId = `${baseId}-settle-full`;

  if (!expense) return null;

  const currency = expenseCurrency(expense);
  const deleteLabel = paymentPendingDelete
    ? `${formatLoanNumber(parseAmount(paymentPendingDelete.amount), locale)} · ${formatDateShort(paymentPendingDelete.date, localeTag)}`
    : "";

  return (
    <>
      <ConfirmDeleteAlertDialog
        open={paymentPendingDelete != null}
        onOpenChange={(next) => {
          if (!next) setPaymentPendingDelete(null);
        }}
        title={t.events.expenses.deletePaymentTitle}
        description={t.events.expenses.deletePaymentDescription}
        itemLabel={deleteLabel || null}
        cancelLabel={t.events.deleteCancel}
        confirmLabel={t.events.deleteConfirm}
        onConfirm={handleConfirmDeletePayment}
      />

      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent side="right" className="flex w-full max-w-lg flex-col gap-0 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{t.events.expenses.paymentListSheetTitle}</SheetTitle>
            <p className="text-sm text-muted-foreground">
              {expense.name}
              {" · "}
              {currency}
            </p>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pb-4">
            <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                    <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.events.expenses.paymentListDate}
                    </TableHead>
                    <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.events.expenses.paymentListAmount}
                    </TableHead>
                    <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.events.expenses.paymentListNote}
                    </TableHead>
                    <TableHead className="w-24 px-2 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.events.expenses.paymentListActions}
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
                      <TableCell className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                        {p.note?.trim() || "—"}
                      </TableCell>
                      <TableCell className="px-2 py-1 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-8"
                            aria-label={t.events.expenses.editPayment}
                            onClick={() => startEdit(p)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-8 text-destructive hover:text-destructive"
                            aria-label={t.events.expenses.deletePayment}
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
                <p className="mb-3 text-sm text-muted-foreground">
                  {t.events.expenses.paymentListFullyPaidHint}
                </p>
              ) : null}

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                <NaturalDateField
                  id={`${baseId}-date`}
                  locale={locale}
                  label={t.events.fields.paymentDate}
                  hint={t.events.fields.dateHint}
                  placeholder={t.events.fields.dateNaturalPlaceholder}
                  valueIso={draftDate}
                  onChangeIso={(iso) => {
                    setDraftDate(iso);
                    setFormError(null);
                  }}
                  disabled={!editingId && !canAddMore}
                />
                <Field data-invalid={formError ? true : undefined}>
                  <FieldLabel htmlFor={`${baseId}-amount`}>
                    {t.events.fields.paymentAmount}
                  </FieldLabel>
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
                        {t.events.expenses.paymentSettleFullLabel}
                      </label>
                    </div>
                  ) : null}
                  {canAddMore || editingId ? (
                    <FieldDescription>
                      {t.events.expenses.paymentListMaxHint.replace(
                        "{amount}",
                        `${currency} ${formatLoanNumber(maxExtra, locale)}`
                      )}
                    </FieldDescription>
                  ) : null}
                  {formError ? (
                    <FieldDescription className="text-destructive">{formError}</FieldDescription>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${baseId}-note`}>{t.events.fields.paymentNote}</FieldLabel>
                  <Textarea
                    id={`${baseId}-note`}
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    placeholder={t.events.fields.paymentNotePlaceholder}
                    rows={2}
                    disabled={!editingId && !canAddMore}
                  />
                </Field>

                <SheetFooter className="flex-row flex-wrap justify-end gap-2 border-0 p-0 sm:flex-row">
                  {editingId ? (
                    <>
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        {t.events.expenses.paymentListCancelEdit}
                      </Button>
                      <Button type="submit">{t.events.expenses.paymentListSaveEdit}</Button>
                    </>
                  ) : (
                    <Button type="submit" disabled={!canAddMore}>
                      {t.events.expenses.paymentListSaveNew}
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

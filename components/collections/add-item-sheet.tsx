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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NaturalDateField } from "@/components/common/natural-date-field";
import { useI18n } from "@/components/providers/i18n-provider";
import { isCollectionItemLinkInputValid } from "@/lib/collections/collections-helpers";
import { POSSESSION_STATUSES, type NSKCollectionItem, type PossessionStatus } from "@/lib/collections/schema";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

type AddItemSheetProps = {
  open: boolean;
  editingItem: NSKCollectionItem | null;
  showPrice: boolean;
  showLink: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    notes: string;
    possession_status: PossessionStatus;
    related_date: string;
    related_person: string;
    currency: string;
    price: string;
    link: string;
  }) => void;
};

export function AddItemSheet({
  open,
  editingItem,
  showPrice,
  showLink,
  onClose,
  onSubmit,
}: AddItemSheetProps) {
  const { locale, t } = useI18n();
  const baseId = useId();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<PossessionStatus>("owned");
  const [relatedDate, setRelatedDate] = useState("");
  const [relatedPerson, setRelatedPerson] = useState("");
  const [currency, setCurrency] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingItem) {
        setName(editingItem.name);
        setNotes(editingItem.notes ?? "");
        setStatus(editingItem.possession_status);
        setRelatedDate(editingItem.related_date ?? "");
        setRelatedPerson(editingItem.related_person ?? "");
        setCurrency(
          editingItem.currency?.trim() || (editingItem.price != null ? "USD" : "")
        );
        setPrice(editingItem.price != null ? String(editingItem.price) : "");
        setLink(editingItem.link ?? "");
      } else {
        setName("");
        setNotes("");
        setStatus("owned");
        setRelatedDate("");
        setRelatedPerson("");
        setCurrency("USD");
        setPrice("");
        setLink("");
      }
      setError(null);
      setLinkError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingItem]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.collections.errors.itemNameRequired);
      return;
    }
    if (showLink && !isCollectionItemLinkInputValid(link)) {
      setLinkError(t.collections.errors.invalidItemLink);
      return;
    }
    setError(null);
    setLinkError(null);
    onSubmit({
      name: trimmed,
      notes: notes.trim(),
      possession_status: status,
      related_date: relatedDate.trim(),
      related_person: relatedPerson.trim(),
      currency: currency.trim(),
      price: price.trim(),
      link: link.trim(),
    });
    onClose();
  }

  const showLendingFields = status === "lent_out" || status === "borrowed";
  const title = editingItem ? t.collections.editItem : t.collections.addItem;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
        >
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={`${baseId}-name`}>
              {t.collections.fields.itemName}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-name`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={t.collections.fields.itemNamePlaceholder}
              autoFocus
            />
            {error ? (
              <FieldDescription className="text-destructive">{error}</FieldDescription>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor={`${baseId}-notes`}>{t.collections.fields.notes}</FieldLabel>
            <Textarea
              id={`${baseId}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.collections.fields.notesPlaceholder}
              rows={3}
            />
          </Field>

          {showLink ? (
            <Field data-invalid={linkError ? true : undefined}>
              <FieldLabel htmlFor={`${baseId}-link`}>{t.collections.fields.itemLink}</FieldLabel>
              <Input
                id={`${baseId}-link`}
                type="text"
                inputMode="url"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  setLinkError(null);
                }}
                placeholder={t.collections.fields.itemLinkPlaceholder}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="url"
              />
              {linkError ? (
                <FieldDescription className="text-destructive">{linkError}</FieldDescription>
              ) : null}
            </Field>
          ) : null}

          <Field>
            <FieldLabel htmlFor={`${baseId}-status`}>{t.collections.fields.possessionStatus}</FieldLabel>
            <Select
              value={status}
              itemToStringLabel={(value) => t.collections.possessionLabels[value as PossessionStatus]}
              onValueChange={(v) => v && setStatus(v as PossessionStatus)}
            >
              <SelectTrigger id={`${baseId}-status`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSSESSION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t.collections.possessionLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {showLendingFields ? (
            <>
              <NaturalDateField
                id={`${baseId}-related-date`}
                locale={locale}
                label={t.collections.fields.relatedDate}
                hint={t.collections.fields.relatedDateHint}
                placeholder={t.collections.fields.relatedDatePlaceholder}
                valueIso={relatedDate}
                onChangeIso={setRelatedDate}
              />
              <Field>
                <FieldLabel htmlFor={`${baseId}-related-person`}>
                  {t.collections.fields.relatedPerson}
                </FieldLabel>
                <Input
                  id={`${baseId}-related-person`}
                  value={relatedPerson}
                  onChange={(e) => setRelatedPerson(e.target.value)}
                  placeholder={t.collections.fields.relatedPersonPlaceholder}
                />
              </Field>
            </>
          ) : null}

          {showPrice ? (
            <>
              <Field>
                <FieldLabel htmlFor={`${baseId}-currency`}>{t.collections.fields.currency}</FieldLabel>
                <Input
                  id={`${baseId}-currency`}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder={t.collections.fields.currencyPlaceholder}
                  autoCapitalize="characters"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${baseId}-price`}>{t.collections.fields.price}</FieldLabel>
                <Input
                  id={`${baseId}-price`}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t.collections.fields.pricePlaceholder}
                />
              </Field>
            </>
          ) : null}

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.collections.cancel}
            </Button>
            <Button type="submit">
              {editingItem ? t.collections.save : t.collections.addItem}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

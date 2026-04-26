"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKCollection } from "@/lib/collections/schema";

export type CollectionFormValues = {
  name: string;
  show_price: boolean;
  show_link: boolean;
};

type AddCollectionSheetProps = {
  open: boolean;
  editingCollection: NSKCollection | null;
  initialNameWhenCreate?: string;
  onClose: () => void;
  onSubmit: (values: CollectionFormValues) => void;
};

export function AddCollectionSheet({
  open,
  editingCollection,
  initialNameWhenCreate,
  onClose,
  onSubmit,
}: AddCollectionSheetProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingCollection) {
        setName(editingCollection.name);
        setShowPrice(editingCollection.show_price);
        setShowLink(editingCollection.show_link);
      } else {
        setName(initialNameWhenCreate?.trim() || "");
        setShowPrice(false);
        setShowLink(false);
      }
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingCollection, initialNameWhenCreate]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.collections.errors.collectionNameRequired);
      return;
    }
    onSubmit({ name: trimmed, show_price: showPrice, show_link: showLink });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {editingCollection ? t.collections.editCollection : t.collections.addCollection}
          </SheetTitle>
        </SheetHeader>
        <Field>
          <FieldLabel>{t.collections.fields.collectionName}</FieldLabel>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder={t.collections.fields.collectionNamePlaceholder}
            autoFocus
          />
          {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
        </Field>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/10 px-3 py-3">
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor="collection-show-price" className="text-sm font-medium">
              {t.collections.fields.showPrice}
            </Label>
            <p className="text-xs text-muted-foreground">{t.collections.fields.showPriceHint}</p>
          </div>
          <Switch id="collection-show-price" checked={showPrice} onCheckedChange={setShowPrice} />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/10 px-3 py-3">
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor="collection-show-link" className="text-sm font-medium">
              {t.collections.fields.showLink}
            </Label>
            <p className="text-xs text-muted-foreground">{t.collections.fields.showLinkHint}</p>
          </div>
          <Switch id="collection-show-link" checked={showLink} onCheckedChange={setShowLink} />
        </div>
        <SheetFooter className="mt-auto flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.collections.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t.collections.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

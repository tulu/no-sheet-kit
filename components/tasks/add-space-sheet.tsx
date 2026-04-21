"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKSpace } from "@/lib/tasks/schema";

type AddSpaceSheetProps = {
  open: boolean;
  editingSpace: NSKSpace | null;
  /** When creating a space (`editingSpace` null), seed the name field (e.g. localized "Personal"). */
  initialNameWhenCreate?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export function AddSpaceSheet({
  open,
  editingSpace,
  initialNameWhenCreate,
  onClose,
  onSubmit,
}: AddSpaceSheetProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      setName(editingSpace?.name ?? (initialNameWhenCreate?.trim() || ""));
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingSpace, initialNameWhenCreate]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.tasks.errors.spaceNameRequired);
      return;
    }
    onSubmit(trimmed);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editingSpace ? t.tasks.editSpace : t.tasks.addSpace}</SheetTitle>
        </SheetHeader>
        <Field>
          <FieldLabel>{t.tasks.fields.spaceName}</FieldLabel>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder={t.tasks.fields.spaceNamePlaceholder}
            autoFocus
          />
          {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
        </Field>
        <SheetFooter className="mt-auto flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.tasks.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t.tasks.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

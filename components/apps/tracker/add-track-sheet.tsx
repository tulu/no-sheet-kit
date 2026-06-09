"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKTrackerTrack } from "@/lib/tracker/schema";

type AddTrackSheetProps = {
  open: boolean;
  editingTrack: NSKTrackerTrack | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export function AddTrackSheet({ open, editingTrack, onClose, onSubmit }: AddTrackSheetProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      setName(editingTrack?.name ?? "");
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingTrack]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.tracker.errors.trackNameRequired);
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editingTrack ? t.tracker.editTrack : t.tracker.addTrack}</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <Field>
            <FieldLabel>{t.tracker.fields.trackName}</FieldLabel>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={t.tracker.fields.trackNamePlaceholderExample}
              autoFocus
            />
            {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
          </Field>
        </div>
        <SheetFooter className="mt-auto flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.tracker.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t.tracker.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

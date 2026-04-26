"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKCollection } from "@/lib/collections/schema";

export type DeleteCollectionWithItemsDialogProps = {
  open: boolean;
  collection: NSKCollection | null;
  otherCollections: NSKCollection[];
  itemCount: number;
  onOpenChange: (open: boolean) => void;
  onMoveAndDelete: (targetCollectionId: string) => void;
  onDeleteAllItems: () => void;
};

export function DeleteCollectionWithItemsDialog({
  open,
  collection,
  otherCollections,
  itemCount,
  onOpenChange,
  onMoveAndDelete,
  onDeleteAllItems,
}: DeleteCollectionWithItemsDialogProps) {
  const { t } = useI18n();
  const initialTarget =
    collection != null ? (otherCollections.find((c) => c.id !== collection.id)?.id ?? "") : "";
  const [targetId, setTargetId] = useState(initialTarget);

  if (!collection) return null;

  const canMove = otherCollections.some((c) => c.id !== collection.id) && targetId.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md sm:max-w-lg" size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>{t.collections.deleteCollectionWithItemsTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.collections.deleteCollectionWithItemsDescription
              .replace("{name}", collection.name)
              .replace("{count}", String(itemCount))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {otherCollections.filter((c) => c.id !== collection.id).length > 0 ? (
          <Field className="gap-2">
            <FieldLabel>{t.collections.deleteCollectionMoveTargetLabel}</FieldLabel>
            <Select
              value={targetId}
              itemToStringLabel={(value) =>
                otherCollections.find((c) => c.id === value)?.name ?? String(value ?? "")
              }
              onValueChange={(v) => setTargetId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.collections.deleteCollectionMoveTargetPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {otherCollections
                  .filter((c) => c.id !== collection.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <p className="text-sm text-muted-foreground">{t.collections.deleteCollectionNoOther}</p>
        )}
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col sm:justify-stretch">
          <Button
            type="button"
            disabled={!canMove}
            onClick={() => {
              if (!canMove) return;
              onMoveAndDelete(targetId);
              onOpenChange(false);
            }}
          >
            {t.collections.deleteCollectionMoveAndDelete}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onDeleteAllItems();
              onOpenChange(false);
            }}
          >
            {t.collections.deleteCollectionDeleteAllItems}
          </Button>
          <AlertDialogCancel>{t.collections.deleteCancel}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import type { NSKSpace } from "@/lib/tasks/schema";

export type DeleteSpaceWithTasksDialogProps = {
  open: boolean;
  space: NSKSpace | null;
  otherSpaces: NSKSpace[];
  taskCount: number;
  onOpenChange: (open: boolean) => void;
  onMoveAndDelete: (targetSpaceId: string) => void;
  onDeleteAllTasks: () => void;
};

export function DeleteSpaceWithTasksDialog({
  open,
  space,
  otherSpaces,
  taskCount,
  onOpenChange,
  onMoveAndDelete,
  onDeleteAllTasks,
}: DeleteSpaceWithTasksDialogProps) {
  const { t } = useI18n();
  const initialTarget =
    space != null ? (otherSpaces.find((s) => s.id !== space.id)?.id ?? "") : "";
  const [targetId, setTargetId] = useState(initialTarget);

  if (!space) return null;

  const canMove = otherSpaces.some((s) => s.id !== space.id) && targetId.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md sm:max-w-lg" size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>{t.tasks.deleteSpaceWithTasksTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.tasks.deleteSpaceWithTasksDescription.replace("{name}", space.name).replace("{count}", String(taskCount))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {otherSpaces.filter((s) => s.id !== space.id).length > 0 ? (
          <Field className="gap-2">
            <FieldLabel>{t.tasks.deleteSpaceMoveTargetLabel}</FieldLabel>
            <Select
              value={targetId}
              itemToStringLabel={(value) => otherSpaces.find((s) => s.id === value)?.name ?? String(value ?? "")}
              onValueChange={(v) => setTargetId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.tasks.deleteSpaceMoveTargetPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {otherSpaces
                  .filter((s) => s.id !== space.id)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <p className="text-sm text-muted-foreground">{t.tasks.deleteSpaceNoOtherSpace}</p>
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
            {t.tasks.deleteSpaceMoveAndDelete}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onDeleteAllTasks();
              onOpenChange(false);
            }}
          >
            {t.tasks.deleteSpaceDeleteAllTasks}
          </Button>
          <AlertDialogCancel>{t.tasks.deleteCancel}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

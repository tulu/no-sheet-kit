"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ConfirmDeleteAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Copy that may include a `{label}` placeholder replaced by `itemLabel`. */
  description: string;
  itemLabel: string | null;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export function ConfirmDeleteAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  itemLabel,
  cancelLabel,
  confirmLabel,
  onConfirm,
}: ConfirmDeleteAlertDialogProps) {
  const body =
    itemLabel != null && itemLabel !== ""
      ? description.replace("{label}", itemLabel)
      : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

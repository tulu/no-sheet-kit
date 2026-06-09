"use client";

import { useEffect, useState } from "react";
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
import type { NSKTrackerTrack } from "@/lib/tracker/schema";

export type DeleteTrackWithEntriesDialogProps = {
  open: boolean;
  track: NSKTrackerTrack | null;
  otherTracks: NSKTrackerTrack[];
  entryCount: number;
  onOpenChange: (open: boolean) => void;
  onMoveAndDelete: (targetTrackId: string) => void;
  onDeleteAllEntries: () => void;
};

export function DeleteTrackWithEntriesDialog({
  open,
  track,
  otherTracks,
  entryCount,
  onOpenChange,
  onMoveAndDelete,
  onDeleteAllEntries,
}: DeleteTrackWithEntriesDialogProps) {
  const { t } = useI18n();
  const initialTarget =
    track != null ? (otherTracks.find((tr) => tr.id !== track.id)?.id ?? "") : "";
  const [targetId, setTargetId] = useState(initialTarget);

  useEffect(() => {
    if (!open) return;
    setTargetId(initialTarget);
  }, [open, initialTarget]);

  if (!track) return null;

  const canMove = otherTracks.some((tr) => tr.id !== track.id) && targetId.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md sm:max-w-lg" size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>{t.tracker.deleteTrackWithEntriesTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.tracker.deleteTrackWithEntriesDescription
              .replace("{name}", track.name)
              .replace("{count}", String(entryCount))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {otherTracks.filter((tr) => tr.id !== track.id).length > 0 ? (
          <Field className="gap-2">
            <FieldLabel>{t.tracker.deleteTrackMoveTargetLabel}</FieldLabel>
            <Select
              value={targetId}
              itemToStringLabel={(value) =>
                otherTracks.find((tr) => tr.id === value)?.name ?? String(value ?? "")
              }
              onValueChange={(v) => setTargetId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.tracker.deleteTrackMoveTargetPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {otherTracks
                  .filter((tr) => tr.id !== track.id)
                  .map((tr) => (
                    <SelectItem key={tr.id} value={tr.id}>
                      {tr.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <p className="text-sm text-muted-foreground">{t.tracker.deleteTrackNoOtherTrack}</p>
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
            {t.tracker.deleteTrackMoveAndDelete}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onDeleteAllEntries();
              onOpenChange(false);
            }}
          >
            {t.tracker.deleteTrackDeleteAllEntries}
          </Button>
          <AlertDialogCancel>{t.tracker.deleteCancel}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

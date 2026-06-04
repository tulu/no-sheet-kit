"use client";

import { Folder, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKSpace } from "@/lib/tasks/schema";

export type ManageSpacesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaces: NSKSpace[];
  onAddSpace: () => void;
  onRenameSpace: (space: NSKSpace) => void;
  onDeleteSpace: (space: NSKSpace) => void;
};

export function ManageSpacesSheet({
  open,
  onOpenChange,
  spaces,
  onAddSpace,
  onRenameSpace,
  onDeleteSpace,
}: ManageSpacesSheetProps) {
  const { t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t.tasks.manageSpacesTitle}</SheetTitle>
        </SheetHeader>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {spaces.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {t.tasks.manageSpacesEmpty}
            </li>
          ) : (
            spaces.map((space) => (
              <li
                key={space.id}
                className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/10 px-3 py-2"
              >
                <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{space.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t.tasks.renameSpace}
                  onClick={() => onRenameSpace(space)}
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  aria-label={t.tasks.deleteSpaceAction}
                  onClick={() => onDeleteSpace(space)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))
          )}
        </ul>
        <SheetFooter className="mt-auto flex-row gap-2 border-t border-border pt-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t.tasks.close}
          </Button>
          <Button type="button" onClick={onAddSpace}>
            <Plus className="mr-1 size-4" aria-hidden />
            {t.tasks.addSpace}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

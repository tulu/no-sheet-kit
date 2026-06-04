"use client";

import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKCollection } from "@/lib/collections/schema";

export type ManageCollectionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: NSKCollection[];
  onAddCollection: () => void;
  onRenameCollection: (collection: NSKCollection) => void;
  onDeleteCollection: (collection: NSKCollection) => void;
};

export function ManageCollectionsSheet({
  open,
  onOpenChange,
  collections,
  onAddCollection,
  onRenameCollection,
  onDeleteCollection,
}: ManageCollectionsSheetProps) {
  const { t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t.collections.manageCollectionsTitle}</SheetTitle>
        </SheetHeader>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {collections.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {t.collections.manageCollectionsEmpty}
            </li>
          ) : (
            collections.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/10 px-3 py-2"
              >
                <Layers className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t.collections.renameCollection}
                  onClick={() => onRenameCollection(c)}
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  aria-label={t.collections.deleteCollectionAction}
                  onClick={() => onDeleteCollection(c)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))
          )}
        </ul>
        <SheetFooter className="mt-auto flex-row gap-2 border-t border-border pt-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t.collections.close}
          </Button>
          <Button type="button" onClick={onAddCollection}>
            <Plus className="mr-1 size-4" aria-hidden />
            {t.collections.addCollection}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

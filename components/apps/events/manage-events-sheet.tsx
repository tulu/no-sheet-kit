"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKEvent } from "@/lib/events/schema";

type ManageEventsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: NSKEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: NSKEvent) => void;
  onDeleteEvent: (event: NSKEvent) => void;
};

export function ManageEventsSheet({
  open,
  onOpenChange,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}: ManageEventsSheetProps) {
  const { t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t.events.manageEventsTitle}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.events.manageEventsEmpty}</p>
          ) : (
            <ul className="space-y-1">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm font-medium">{ev.name}</span>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t.events.editEvent}
                      onClick={() => onEditEvent(ev)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t.events.deleteEventTitle}
                      onClick={() => onDeleteEvent(ev)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button type="button" variant="outline" className="w-full gap-2" onClick={onAddEvent}>
            <Plus className="size-4" />
            {t.events.addEvent}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

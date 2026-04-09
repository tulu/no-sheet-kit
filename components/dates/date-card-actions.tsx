"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/components/providers/i18n-provider";

type DateCardActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function DateCardActions({ onEdit, onDelete }: DateCardActionsProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="size-8 shrink-0"
            aria-label={t.dates.cardActionsMenu}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-36 p-1">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          {t.dates.edit}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
        >
          {t.dates.delete}
        </button>
      </PopoverContent>
    </Popover>
  );
}

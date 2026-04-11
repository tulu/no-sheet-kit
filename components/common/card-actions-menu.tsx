"use client";

import { useState } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type CardActionsMenuItem = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
};

export type CardActionsMenuProps = {
  ariaLabel: string;
  actions: CardActionsMenuItem[];
};

export function CardActionsMenu({ ariaLabel, actions }: CardActionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="size-8 shrink-0"
            aria-label={ariaLabel}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex w-max min-w-44 max-w-[min(100vw-2rem,18rem)] flex-col gap-0.5 p-1.5"
      >
        {actions.map((action, index) => (
          <button
            key={`${action.label}-${index}`}
            type="button"
            onClick={() => {
              setOpen(false);
              action.onSelect();
            }}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted",
              action.destructive && "text-destructive"
            )}
          >
            <span className="min-w-0 flex-1">{action.label}</span>
            <action.icon
              className={cn(
                "size-4 shrink-0",
                action.destructive ? "text-destructive" : "text-muted-foreground"
              )}
              aria-hidden
            />
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

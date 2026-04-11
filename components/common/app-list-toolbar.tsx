"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppListViewModeDef<TView extends string> = {
  id: TView;
  icon: LucideIcon;
  ariaLabel: string;
};

type AppListToolbarProps<TView extends string> = {
  totalLabel: string;
  viewModes?: AppListViewModeDef<TView>[];
  viewMode: TView;
  onViewModeChange: (next: TView) => void;
  addButtonLabel: string;
  onAdd: () => void;
};

export function AppListToolbar<TView extends string>({
  totalLabel,
  viewModes,
  viewMode,
  onViewModeChange,
  addButtonLabel,
  onAdd,
}: AppListToolbarProps<TView>) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">{totalLabel}</p>

      <div className="flex items-center gap-2">
        {viewModes && viewModes.length > 0 ? (
          <div className="inline-flex rounded-md border border-border bg-background p-0.5">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onViewModeChange(mode.id)}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground",
                  viewMode === mode.id && "bg-muted text-foreground"
                )}
                aria-label={mode.ariaLabel}
              >
                <mode.icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
        ) : null}
        <Button onClick={onAdd}>{addButtonLabel}</Button>
      </div>
    </div>
  );
}

"use client";

import { Search, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AppListViewModeDef<TView extends string> = {
  id: TView;
  icon: LucideIcon;
  ariaLabel: string;
};

export type AppListToolbarSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  "aria-label"?: string;
};

type AppListToolbarProps<TView extends string> = {
  totalLabel: string;
  viewModes?: AppListViewModeDef<TView>[];
  viewMode: TView;
  onViewModeChange: (next: TView) => void;
  addButtonLabel: string;
  onAdd: () => void;
  /** When omitted, other apps keep the toolbar compact without a search field. */
  search?: AppListToolbarSearchProps;
};

export function AppListToolbar<TView extends string>({
  totalLabel,
  viewModes,
  viewMode,
  onViewModeChange,
  addButtonLabel,
  onAdd,
  search,
}: AppListToolbarProps<TView>) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="shrink-0 text-sm text-muted-foreground">{totalLabel}</p>
        {search ? (
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder}
              aria-label={search["aria-label"] ?? search.placeholder}
              type="search"
              autoComplete="off"
              className="h-9 pl-9"
            />
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
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

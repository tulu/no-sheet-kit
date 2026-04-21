"use client";

import type { ReactNode } from "react";
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
  /** `null` until the app has read the persisted view (no mode looks selected). */
  viewMode: TView | null;
  onViewModeChange: (next: TView) => void;
  addButtonLabel: string;
  onAdd: () => void;
  /** When false, the primary add button is hidden (e.g. views that are not tied to one list). */
  showAddButton?: boolean;
  /** When omitted, other apps keep the toolbar compact without a search field. */
  search?: AppListToolbarSearchProps;
  /** Rendered after the search field in the leading cluster (e.g. toggles). */
  searchTrailing?: ReactNode;
};

export function AppListToolbar<TView extends string>({
  totalLabel,
  viewModes,
  viewMode,
  onViewModeChange,
  addButtonLabel,
  onAdd,
  search,
  searchTrailing,
  showAddButton = true,
}: AppListToolbarProps<TView>) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="shrink-0 text-sm text-muted-foreground">{totalLabel}</p>
        {search || searchTrailing ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:flex-row sm:gap-4">
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
            {searchTrailing ? (
              <div className="flex shrink-0 items-center gap-2">{searchTrailing}</div>
            ) : null}
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
                  viewMode != null && viewMode === mode.id && "bg-muted text-foreground"
                )}
                aria-pressed={viewMode != null && viewMode === mode.id}
                aria-label={mode.ariaLabel}
              >
                <mode.icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
        ) : null}
        {showAddButton ? <Button onClick={onAdd}>{addButtonLabel}</Button> : null}
      </div>
    </div>
  );
}

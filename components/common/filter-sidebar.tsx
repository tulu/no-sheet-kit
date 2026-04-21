"use client";

import type { ReactNode } from "react";
import { PanelLeft, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type FilterSidebarTone = "default" | "destructive" | "accent";

export type FilterSidebarItem<T extends string = string> = {
  id: T;
  label: string;
  icon: LucideIcon;
  count: number;
  /** When true, no trailing count is shown (e.g. dashboard overview). */
  hideCount?: boolean;
  tone?: FilterSidebarTone;
  /** Draw a divider above this row (e.g. before dynamically appended filters). */
  dividerBefore?: boolean;
};

export type FilterSidebarNavProps<T extends string> = {
  items: FilterSidebarItem<T>[];
  activeId: T;
  onFilterChange: (id: T) => void;
  onAfterSelect?: () => void;
};

export function FilterSidebarNav<T extends string>({
  items,
  activeId,
  onFilterChange,
  onAfterSelect,
}: FilterSidebarNavProps<T>) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === activeId;
        const tone = item.tone ?? "default";
        const destructive = tone === "destructive";
        const accent = tone === "accent";
        return (
          <li key={item.id} className={cn(item.dividerBefore && "mt-2 border-t border-border pt-2")}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isActive &&
                  tone === "default" &&
                  "bg-accent font-medium text-accent-foreground",
                isActive &&
                  destructive &&
                  "border border-destructive/40 bg-destructive/10 font-medium text-destructive",
                isActive &&
                  accent &&
                  "border border-teal-500/40 bg-teal-500/10 font-medium text-teal-900 dark:border-teal-400/35 dark:bg-teal-500/15 dark:text-teal-100",
                !isActive &&
                  tone === "default" &&
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                !isActive &&
                  destructive &&
                  "border border-transparent text-destructive/90 hover:border-destructive/25 hover:bg-destructive/5",
                !isActive &&
                  accent &&
                  "border border-transparent text-teal-800/95 hover:border-teal-500/25 hover:bg-teal-500/10 dark:text-teal-200/90 dark:hover:border-teal-400/20 dark:hover:bg-teal-500/10"
              )}
              aria-current={isActive ? "true" : undefined}
              onClick={() => {
                onFilterChange(item.id);
                onAfterSelect?.();
              }}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  accent && !isActive && "text-teal-600 dark:text-teal-400",
                  accent && isActive && "text-teal-700 dark:text-teal-300"
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.hideCount ? null : (
                <span
                  className={cn(
                    "tabular-nums",
                    destructive && "text-destructive/80",
                    accent &&
                      (isActive
                        ? "text-teal-900/80 dark:text-teal-100/85"
                        : "text-teal-700/90 dark:text-teal-400/90"),
                    tone === "default" && "text-muted-foreground"
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export type FilterSidebarDesktopAsideProps<T extends string> = {
  title: string;
  navAriaLabel?: string;
  /** e.g. “Manage spaces” pinned under the scrollable nav */
  footer?: ReactNode;
} & FilterSidebarNavProps<T>;

export function FilterSidebarDesktopAside<T extends string>({
  title,
  navAriaLabel,
  footer,
  items,
  activeId,
  onFilterChange,
}: FilterSidebarDesktopAsideProps<T>) {
  const aria = navAriaLabel ?? title;
  return (
    <aside className="hidden min-h-0 w-75 shrink-0 flex-col border-r border-border bg-background/90 backdrop-blur-md md:flex">
      <div className="flex h-full min-h-0 flex-1 flex-col gap-3 p-4">
        <h2 className="shrink-0 text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        <nav
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          aria-label={aria}
        >
          <FilterSidebarNav
            items={items}
            activeId={activeId}
            onFilterChange={onFilterChange}
          />
        </nav>
        {footer ? <div className="shrink-0">{footer}</div> : null}
      </div>
    </aside>
  );
}

export type FilterSidebarMobileSheetProps<T extends string> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  navAriaLabel?: string;
  footer?: ReactNode;
} & FilterSidebarNavProps<T>;

export function FilterSidebarMobileSheet<T extends string>({
  open,
  onOpenChange,
  title,
  navAriaLabel,
  footer,
  items,
  activeId,
  onFilterChange,
}: FilterSidebarMobileSheetProps<T>) {
  const aria = navAriaLabel ?? title;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[min(100%,22rem)] flex-col bg-background/90 backdrop-blur-md sm:max-w-[22rem]"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <nav className="min-h-0 flex-1 overflow-auto px-4 pb-2" aria-label={aria}>
          <FilterSidebarNav
            items={items}
            activeId={activeId}
            onFilterChange={onFilterChange}
            onAfterSelect={() => onOpenChange(false)}
          />
        </nav>
        {footer ? (
          <div className="shrink-0 border-t border-border px-4 py-3">{footer}</div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export type FilterSidebarMobileBarProps = {
  title: string;
  onOpen: () => void;
  openButtonAriaLabel: string;
  /** Right-aligned actions (e.g. settings) */
  endSlot?: ReactNode;
};

export function FilterSidebarMobileBar({
  title,
  onOpen,
  openButtonAriaLabel,
  endSlot,
}: FilterSidebarMobileBarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-md md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onOpen}
        aria-label={openButtonAriaLabel}
      >
        <PanelLeft className="size-4 rtl:rotate-180" aria-hidden />
      </Button>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{title}</span>
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </div>
  );
}

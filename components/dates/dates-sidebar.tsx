"use client";

import {
  Bell,
  Cake,
  CalendarRange,
  CircleEllipsis,
  Flag,
  Flower2,
  HeartHandshake,
  type LucideIcon,
  PanelLeft,
} from "lucide-react";
import type { DateFilterId } from "@/lib/dates/schema";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const FILTER_ORDER: DateFilterId[] = [
  "all",
  "birthday",
  "anniversary",
  "reminder",
  "milestone",
  "memorial",
  "other",
];

const FILTER_ICONS: Record<DateFilterId, LucideIcon> = {
  all: CalendarRange,
  birthday: Cake,
  anniversary: HeartHandshake,
  reminder: Bell,
  milestone: Flag,
  memorial: Flower2,
  other: CircleEllipsis,
};

type DatesCategoryNavProps = {
  activeFilter: DateFilterId;
  onFilterChange: (next: DateFilterId) => void;
  counts: Record<DateFilterId, number>;
  /** Called after a category is chosen (e.g. close mobile sheet). */
  onAfterSelect?: () => void;
};

export function DatesCategoryNav({
  activeFilter,
  onFilterChange,
  counts,
  onAfterSelect,
}: DatesCategoryNavProps) {
  const { t } = useI18n();

  return (
    <ul className="flex flex-col gap-1">
      {FILTER_ORDER.map((filterId) => {
        const Icon = FILTER_ICONS[filterId];
        const label = t.dates.types[filterId];
        const isActive = filterId === activeFilter;
        return (
          <li key={filterId}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive ? "true" : undefined}
              onClick={() => {
                onFilterChange(filterId);
                onAfterSelect?.();
              }}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <span className="tabular-nums text-muted-foreground">{counts[filterId]}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type DatesCategoryDesktopAsideProps = DatesCategoryNavProps;

export function DatesCategoryDesktopAside(props: DatesCategoryDesktopAsideProps) {
  const { t } = useI18n();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background/90 backdrop-blur-md md:flex">
      <div className="sticky top-0 flex flex-col gap-3 p-4">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{t.dates.sidebarTitle}</h2>
        <nav aria-label={t.dates.sidebarTitle}>
          <DatesCategoryNav {...props} />
        </nav>
      </div>
    </aside>
  );
}

type DatesCategoriesMobileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & DatesCategoryNavProps;

export function DatesCategoriesMobileSheet({
  open,
  onOpenChange,
  activeFilter,
  onFilterChange,
  counts,
}: DatesCategoriesMobileSheetProps) {
  const { t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(100%,22rem)] bg-background/90 backdrop-blur-md sm:max-w-[22rem]"
      >
        <SheetHeader>
          <SheetTitle>{t.dates.sidebarTitle}</SheetTitle>
        </SheetHeader>
        <nav className="px-4 pb-4" aria-label={t.dates.sidebarTitle}>
          <DatesCategoryNav
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            counts={counts}
            onAfterSelect={() => onOpenChange(false)}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

type DatesCategoryMobileBarProps = {
  onOpenCategories: () => void;
};

export function DatesCategoryMobileBar({ onOpenCategories }: DatesCategoryMobileBarProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-md md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onOpenCategories}
        aria-label={t.dates.openCategoriesNav}
      >
        <PanelLeft className="size-4 rtl:rotate-180" aria-hidden />
      </Button>
      <span className="text-sm font-medium text-foreground">{t.dates.sidebarTitle}</span>
    </div>
  );
}

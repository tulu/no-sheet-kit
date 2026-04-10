"use client";

import {
  AlertTriangle,
  Ban,
  CircleParking,
  Globe,
  PanelLeft,
  RadioTower,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { DomainFilterId } from "@/lib/domains/schema";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type DomainStatusFilterId = Exclude<DomainFilterId, "expiring_soon">;

const FILTER_BASE: DomainStatusFilterId[] = [
  "all",
  "active",
  "parked",
  "for_sale",
  "abandoned",
];

const FILTER_ICONS: Record<DomainFilterId, LucideIcon> = {
  all: Globe,
  active: RadioTower,
  parked: CircleParking,
  for_sale: Tag,
  abandoned: Ban,
  expiring_soon: AlertTriangle,
};

type DomainsFilterNavProps = {
  activeFilter: DomainFilterId;
  onFilterChange: (next: DomainFilterId) => void;
  counts: Record<DomainFilterId, number>;
  onAfterSelect?: () => void;
};

export function DomainsFilterNav({
  activeFilter,
  onFilterChange,
  counts,
  onAfterSelect,
}: DomainsFilterNavProps) {
  const { t } = useI18n();

  function row(
    filterId: DomainFilterId,
    label: string,
    count: number,
    options?: { destructive?: boolean }
  ) {
    const Icon = FILTER_ICONS[filterId];
    const isActive = filterId === activeFilter;
    const destructive = options?.destructive ?? false;
    return (
      <li key={filterId}>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
            isActive && !destructive && "bg-accent font-medium text-accent-foreground",
            isActive && destructive && "border border-destructive/40 bg-destructive/10 font-medium text-destructive",
            !isActive &&
              !destructive &&
              "text-muted-foreground hover:bg-muted hover:text-foreground",
            !isActive &&
              destructive &&
              "border border-transparent text-destructive/90 hover:border-destructive/25 hover:bg-destructive/5"
          )}
          aria-current={isActive ? "true" : undefined}
          onClick={() => {
            onFilterChange(filterId);
            onAfterSelect?.();
          }}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <span
            className={cn(
              "tabular-nums",
              destructive ? "text-destructive/80" : "text-muted-foreground"
            )}
          >
            {count}
          </span>
        </button>
      </li>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {FILTER_BASE.map((filterId) =>
        row(filterId, t.domains.types[filterId], counts[filterId])
      )}
      {counts.expiring_soon > 0
        ? row("expiring_soon", t.domains.types.expiringSoon, counts.expiring_soon, {
            destructive: true,
          })
        : null}
    </ul>
  );
}

type DomainsFilterDesktopAsideProps = DomainsFilterNavProps;

export function DomainsFilterDesktopAside(props: DomainsFilterDesktopAsideProps) {
  const { t } = useI18n();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background/90 backdrop-blur-md md:flex">
      <div className="sticky top-0 flex flex-col gap-3 p-4">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{t.domains.sidebarTitle}</h2>
        <nav aria-label={t.domains.sidebarTitle}>
          <DomainsFilterNav {...props} />
        </nav>
      </div>
    </aside>
  );
}

type DomainsFiltersMobileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & DomainsFilterNavProps;

export function DomainsFiltersMobileSheet({
  open,
  onOpenChange,
  ...navProps
}: DomainsFiltersMobileSheetProps) {
  const { t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(100%,22rem)] bg-background/90 backdrop-blur-md sm:max-w-[22rem]"
      >
        <SheetHeader>
          <SheetTitle>{t.domains.sidebarTitle}</SheetTitle>
        </SheetHeader>
        <nav className="px-4 pb-4" aria-label={t.domains.sidebarTitle}>
          <DomainsFilterNav
            {...navProps}
            onAfterSelect={() => onOpenChange(false)}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

type DomainsFilterMobileBarProps = {
  onOpenFilters: () => void;
};

export function DomainsFilterMobileBar({ onOpenFilters }: DomainsFilterMobileBarProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-md md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onOpenFilters}
        aria-label={t.domains.openFiltersNav}
      >
        <PanelLeft className="size-4 rtl:rotate-180" aria-hidden />
      </Button>
      <span className="text-sm font-medium text-foreground">{t.domains.sidebarTitle}</span>
    </div>
  );
}

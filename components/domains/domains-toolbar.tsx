"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainsViewMode } from "@/lib/domains/schema";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type DomainsToolbarProps = {
  total: number;
  viewMode: DomainsViewMode;
  onViewModeChange: (next: DomainsViewMode) => void;
  onAdd: () => void;
};

export function DomainsToolbar({
  total,
  viewMode,
  onViewModeChange,
  onAdd,
}: DomainsToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {t.domains.totalLabel.replace("{count}", String(total))}
      </p>

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-background p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground",
              viewMode === "grid" && "bg-muted text-foreground"
            )}
            aria-label={t.domains.viewGrid}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground",
              viewMode === "list" && "bg-muted text-foreground"
            )}
            aria-label={t.domains.viewList}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={onAdd}>{t.domains.addNew}</Button>
      </div>
    </div>
  );
}

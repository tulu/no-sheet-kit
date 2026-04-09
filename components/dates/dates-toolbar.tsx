"use client";

import { Calendar, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DatesViewMode } from "@/lib/dates/schema";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type DatesToolbarProps = {
  total: number;
  viewMode: DatesViewMode;
  onViewModeChange: (next: DatesViewMode) => void;
  onAdd: () => void;
};

export function DatesToolbar({
  total,
  viewMode,
  onViewModeChange,
  onAdd,
}: DatesToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <p className="text-sm text-muted-foreground">
        {t.dates.totalLabel.replace("{count}", String(total))}
      </p>

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border border-border p-0.5 bg-background">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "h-8 w-8 inline-flex items-center justify-center rounded-sm text-muted-foreground",
              viewMode === "grid" && "bg-muted text-foreground"
            )}
            aria-label={t.dates.viewGrid}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "h-8 w-8 inline-flex items-center justify-center rounded-sm text-muted-foreground",
              viewMode === "list" && "bg-muted text-foreground"
            )}
            aria-label={t.dates.viewList}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("calendar")}
            className={cn(
              "h-8 w-8 inline-flex items-center justify-center rounded-sm text-muted-foreground",
              viewMode === "calendar" && "bg-muted text-foreground"
            )}
            aria-label={t.dates.viewCalendar}
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
        <Button onClick={onAdd}>{t.dates.addNew}</Button>
      </div>
    </div>
  );
}

"use client";

import { CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

type DatesEmptyStateProps = {
  onAdd: () => void;
};

export function DatesEmptyState({ onAdd }: DatesEmptyStateProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <CalendarX2 className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{t.dates.emptyTitle}</h3>
      <p className="text-sm text-muted-foreground mb-6">{t.dates.emptyBody}</p>
      <Button onClick={onAdd}>{t.dates.addNew}</Button>
    </div>
  );
}

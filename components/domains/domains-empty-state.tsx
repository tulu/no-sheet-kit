"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

type DomainsEmptyStateProps = {
  onAdd: () => void;
};

export function DomainsEmptyState({ onAdd }: DomainsEmptyStateProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <Globe className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
      <h3 className="mb-2 text-xl font-semibold text-foreground">{t.domains.emptyTitle}</h3>
      <p className="mb-6 text-sm text-muted-foreground">{t.domains.emptyBody}</p>
      <Button onClick={onAdd}>{t.domains.addNew}</Button>
    </div>
  );
}

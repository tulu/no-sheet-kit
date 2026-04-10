"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/components/providers/i18n-provider";

export function DomainsExpiringBanner() {
  const { t } = useI18n();

  return (
    <div className="shrink-0 border-b border-border px-4 py-3 md:px-6">
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>{t.domains.types.expiringSoon}</AlertTitle>
        <AlertDescription>{t.domains.expiringBanner}</AlertDescription>
      </Alert>
    </div>
  );
}

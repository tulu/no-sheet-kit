"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function AnonymousSessionBanner() {
  const { t } = useI18n();

  return (
    <Alert
      variant="default"
      className={cn(
        "rounded-none border-x-0 border-t-0 py-2.5 sm:rounded-none flex items-center gap-2 justify-center",
        "border-b-amber-400 bg-amber-100 text-amber-950 dark:border-b-amber-600 dark:bg-amber-950 dark:text-amber-50"
      )}
    >
      <AlertTriangle
        className="size-4 shrink-0 text-amber-700 dark:text-amber-300"
        aria-hidden
      />
      <AlertTitle className="text-sm text-amber-950 dark:text-amber-50">
        {t.apps.anonymousBanner.title}
      </AlertTitle>
      <AlertDescription className="text-xs text-amber-900/90 sm:text-sm dark:text-amber-100/90">
        {t.apps.anonymousBanner.description}
      </AlertDescription>
    </Alert>
  );
}

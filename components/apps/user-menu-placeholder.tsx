"use client";

import { ChevronDown, CircleUserRound } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

export function UserMenuPlaceholder() {
  const { t } = useI18n();

  return (
    <details className="relative">
      <summary className="list-none inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 h-9 text-sm text-foreground cursor-pointer">
        <CircleUserRound className="w-4 h-4 text-muted-foreground" />
        <span className="hidden sm:inline">{t.apps.userMenu.label}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </summary>
      <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-popover p-1 shadow-sm z-50">
        <button
          type="button"
          disabled
          className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground"
        >
          {t.apps.userMenu.profile}
        </button>
        <button
          type="button"
          disabled
          className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground"
        >
          {t.apps.userMenu.account}
        </button>
        <button
          type="button"
          disabled
          className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground"
        >
          {t.apps.userMenu.logout}
        </button>
      </div>
    </details>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, CircleUserRound } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function UserMenuPlaceholder() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const settingsHref =
    pathname.startsWith("/apps") && !pathname.startsWith("/apps/settings")
      ? `/apps/settings?returnTo=${encodeURIComponent(pathname)}`
      : "/apps/settings";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 px-2.5"
            aria-expanded={open}
            aria-haspopup="menu"
          />
        }
      >
        <CircleUserRound className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">{t.apps.userMenu.label}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-48 p-1">
        <Link
          href={settingsHref}
          onClick={() => setOpen(false)}
          className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          {t.apps.userMenu.settings}
        </Link>
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground"
        >
          {t.apps.userMenu.logout}
        </button>
      </PopoverContent>
    </Popover>
  );
}

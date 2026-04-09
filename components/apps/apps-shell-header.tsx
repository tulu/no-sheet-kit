"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { resolveAvailableAppFromPath } from "@/lib/apps/catalog";
import { getAppDisplayName } from "@/components/apps/launcher-apps";
import { UserMenuPlaceholder } from "./user-menu-placeholder";
import { AppsSwitcher } from "./apps-switcher";
import { useI18n } from "@/components/providers/i18n-provider";

type AppsShellHeaderProps = {
  title?: string;
};

export function AppsShellHeader({ title: titleProp }: AppsShellHeaderProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const appFromPath = resolveAvailableAppFromPath(pathname);
  const title =
    titleProp ??
    (appFromPath
      ? getAppDisplayName(appFromPath)
      : pathname.startsWith("/apps/settings")
        ? t.apps.settings.title
        : "NoSheetKit");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur-md">
      <div className="flex select-none items-center gap-2.5 text-xl font-semibold text-foreground">
        <Image src="/nsk-iso.png" alt="NoSheetKit" width={28} height={28} className="rounded-[6px]" />
        {title}
      </div>

      <div className="flex items-center gap-2">
        <AppsSwitcher />
        <UserMenuPlaceholder />
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { resolveAvailableAppFromPath } from "@/lib/apps/catalog";
import { getAppDisplayName } from "@/components/apps/launcher-apps";
import { AppsUserMenu } from "./apps-user-menu";
import { AppsSwitcher } from "./apps-switcher";
import { GuestDataRestoreButton } from "./guest-data-restore-button";
import { AppsDriveSaveButton } from "./apps-drive-save-button";
import { useI18n } from "@/components/providers/i18n-provider";

export type AppsShellHeaderProps = {
  title?: string;
  sessionKind: "anonymous" | "google";
  storageSuffix: string;
  googleEmail?: string;
  googleSub?: string;
  googleName?: string;
  googlePicture?: string;
};

export function AppsShellHeader({
  title: titleProp,
  sessionKind,
  storageSuffix,
  googleEmail,
  googleSub,
  googleName,
  googlePicture,
}: AppsShellHeaderProps) {
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
    <header className="flex h-16 items-center justify-between px-6">
      <div className="flex select-none items-center gap-2.5 text-xl font-semibold text-foreground">
        <Image src="/nsk-iso.png" alt="NoSheetKit" width={28} height={28} className="rounded-[6px]" />
        {title}
      </div>

      <div className="flex items-center gap-3">
        {sessionKind === "google" ? <AppsDriveSaveButton /> : null}
        <GuestDataRestoreButton allowLocalZipRestore={sessionKind === "anonymous"} />
        <AppsSwitcher />
        <AppsUserMenu
          sessionKind={sessionKind}
          storageSuffix={storageSuffix}
          googleEmail={googleEmail}
          googleSub={googleSub}
          googleName={googleName}
          googlePicture={googlePicture}
        />
      </div>
    </header>
  );
}

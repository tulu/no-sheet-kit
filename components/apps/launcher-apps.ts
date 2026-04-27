import type { LucideIcon } from "lucide-react";
import { APP_DISPLAY_ICONS, APP_DISPLAY_NAMES, getAppDisplayName } from "@/lib/apps/app-display";
import { APP_ORDER, getAppHref, isAppAvailable, type AppId } from "@/lib/apps/catalog";

const ICONS: Record<AppId, LucideIcon> = APP_DISPLAY_ICONS;

export type LauncherApp = {
  id: AppId;
  icon: LucideIcon;
  displayName: string;
  available: boolean;
  href: string | null;
};

export function getLauncherApps(): LauncherApp[] {
  return APP_ORDER.map((id) => ({
    id,
    icon: ICONS[id],
    displayName: APP_DISPLAY_NAMES[id],
    available: isAppAvailable(id),
    href: getAppHref(id),
  }));
}

export { getAppDisplayName };

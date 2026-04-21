import {
  Banknote,
  CalendarHeart,
  Globe,
  Layers,
  Link2,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import {
  APP_ORDER,
  getAppHref,
  isAppAvailable,
  type AppId,
} from "@/lib/apps/catalog";

const ICONS: Record<AppId, LucideIcon> = {
  loans: Banknote,
  dates: CalendarHeart,
  links: Link2,
  domains: Globe,
  tasks: ListTodo,
  collections: Layers,
};

/** Product names (not translated). */
const DISPLAY_NAMES: Record<AppId, string> = {
  loans: "NSKLoans",
  dates: "NSKDates",
  links: "NSKLinks",
  domains: "NSKDomains",
  tasks: "NSKTasks",
  collections: "NSKCollections",
};

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
    displayName: DISPLAY_NAMES[id],
    available: isAppAvailable(id),
    href: getAppHref(id),
  }));
}

export function getAppDisplayName(id: AppId): string {
  return DISPLAY_NAMES[id];
}

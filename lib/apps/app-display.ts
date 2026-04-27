import {
  Banknote,
  CalendarHeart,
  Globe,
  Layers,
  Link2,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import type { AppId } from "@/lib/apps/catalog";

export const APP_DISPLAY_ICONS: Record<AppId, LucideIcon> = {
  loans: Banknote,
  dates: CalendarHeart,
  links: Link2,
  domains: Globe,
  tasks: ListTodo,
  collections: Layers,
};

/** Product names (not translated). */
export const APP_DISPLAY_NAMES: Record<AppId, string> = {
  loans: "NSKLoans",
  dates: "NSKDates",
  links: "NSKLinks",
  domains: "NSKDomains",
  tasks: "NSKTasks",
  collections: "NSKCollections",
};

export function getAppDisplayName(id: AppId): string {
  return APP_DISPLAY_NAMES[id];
}

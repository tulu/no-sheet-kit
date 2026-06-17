"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { EVENTS_DETAIL_TABS, type EventsDetailTab } from "@/lib/events/schema";

type EventsDetailTabBarProps = {
  activeTab: EventsDetailTab;
  onTabChange: (tab: EventsDetailTab) => void;
};

export function EventsDetailTabBar({ activeTab, onTabChange }: EventsDetailTabBarProps) {
  const { t } = useI18n();

  const labels: Record<EventsDetailTab, string> = {
    info: t.events.tabs.info,
    guests: t.events.tabs.guests,
    tasks: t.events.tabs.tasks,
    expenses: t.events.tabs.expenses,
  };

  return (
    <div
      className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1"
      role="tablist"
    >
      {EVENTS_DETAIL_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onTabChange(tab)}
        >
          {labels[tab]}
        </button>
      ))}
    </div>
  );
}

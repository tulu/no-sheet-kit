"use client";

import { useState, type ReactNode } from "react";
import { Check, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  countActiveGuestFilters,
  type EventGuestKidFilter,
  type EventGuestListFilters,
} from "@/lib/events/events-helpers";
import {
  EVENT_GUEST_RSVP_STATUSES,
  type EventGuestRsvpStatus,
} from "@/lib/events/schema";
import { cn } from "@/lib/utils";

type EventsGuestsFiltersProps = {
  filters: EventGuestListFilters;
  onChange: (filters: EventGuestListFilters) => void;
};

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterOption({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
        selected && "bg-muted/80"
      )}
    >
      <Check className={cn("size-4 shrink-0 text-foreground", !selected && "opacity-0")} aria-hidden />
      <span>{label}</span>
    </button>
  );
}

export function EventsGuestsFilters({ filters, onChange }: EventsGuestsFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const activeCount = countActiveGuestFilters(filters);

  function toggleRsvp(status: EventGuestRsvpStatus) {
    onChange({
      ...filters,
      rsvpStatuses: toggleInList(filters.rsvpStatuses, status),
    });
  }

  function toggleInvitation(sent: boolean) {
    onChange({
      ...filters,
      invitationSent: toggleInList(filters.invitationSent, sent),
    });
  }

  function toggleKid(option: EventGuestKidFilter) {
    onChange({
      ...filters,
      kidOptions: toggleInList(filters.kidOptions, option),
    });
  }

  function handleClear() {
    onChange({
      rsvpStatuses: [],
      invitationSent: [],
      kidOptions: [],
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="relative size-9 shrink-0"
            aria-label={t.events.guests.filters.buttonAria}
          />
        }
      >
        <ListFilter className="size-4" aria-hidden />
        {activeCount > 0 ? (
          <Badge
            variant="secondary"
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] tabular-nums"
          >
            {activeCount}
          </Badge>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-56 space-y-4 p-3">
        <FilterSection title={t.events.guests.filters.sectionRsvp}>
          {EVENT_GUEST_RSVP_STATUSES.map((status) => (
            <FilterOption
              key={status}
              label={t.events.rsvp[status]}
              selected={filters.rsvpStatuses.includes(status)}
              onToggle={() => toggleRsvp(status)}
            />
          ))}
        </FilterSection>

        <FilterSection title={t.events.guests.filters.sectionInvitation}>
          <FilterOption
            label={t.events.guests.filters.invitationSent}
            selected={filters.invitationSent.includes(true)}
            onToggle={() => toggleInvitation(true)}
          />
          <FilterOption
            label={t.events.guests.filters.invitationNotSent}
            selected={filters.invitationSent.includes(false)}
            onToggle={() => toggleInvitation(false)}
          />
        </FilterSection>

        <FilterSection title={t.events.guests.filters.sectionKid}>
          <FilterOption
            label={t.events.fields.isKid}
            selected={filters.kidOptions.includes("kid")}
            onToggle={() => toggleKid("kid")}
          />
          <FilterOption
            label={t.events.guests.filters.adult}
            selected={filters.kidOptions.includes("adult")}
            onToggle={() => toggleKid("adult")}
          />
        </FilterSection>

        {activeCount > 0 ? (
          <Button type="button" variant="ghost" size="sm" className="h-8 w-full" onClick={handleClear}>
            {t.events.guests.filters.clear}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

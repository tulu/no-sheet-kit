"use client";

import { Check, CircleDashed, X, type LucideIcon } from "lucide-react";
import type { CardActionsMenuItem } from "@/components/common/card-actions-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  EVENT_GUEST_RSVP_STATUSES,
  type EventGuestRsvpStatus,
} from "@/lib/events/schema";

const RSVP_ICONS: Record<EventGuestRsvpStatus, LucideIcon> = {
  pending: CircleDashed,
  confirmed: Check,
  declined: X,
};

export function guestRsvpBadgeClass(status: EventGuestRsvpStatus): string {
  switch (status) {
    case "confirmed":
      return "border-emerald-500/40 text-emerald-700 dark:text-emerald-400";
    case "declined":
      return "border-rose-500/40 text-rose-700 dark:text-rose-400";
    default:
      return "text-muted-foreground";
  }
}

export function GuestRsvpBadge({
  status,
  label,
}: {
  status: EventGuestRsvpStatus;
  label: string;
}) {
  return (
    <Badge variant="outline" className={cn("shrink-0 font-medium", guestRsvpBadgeClass(status))}>
      {label}
    </Badge>
  );
}

export function buildRsvpMenuActions(
  current: EventGuestRsvpStatus,
  labels: Record<EventGuestRsvpStatus, string>,
  onChange: (status: EventGuestRsvpStatus) => void
): CardActionsMenuItem[] {
  return EVENT_GUEST_RSVP_STATUSES.filter((status) => status !== current).map((status) => ({
    label: labels[status],
    icon: RSVP_ICONS[status],
    onSelect: () => onChange(status),
  }));
}

"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DateTypeId } from "@/lib/dates/schema";
import { DATE_TYPE_BADGE_CLASS } from "./date-type-badge-classes";

type DateTypeBadgeProps = {
  typeId: DateTypeId;
  children: ReactNode;
  className?: string;
};

export function DateTypeBadge({ typeId, children, className }: DateTypeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", DATE_TYPE_BADGE_CLASS[typeId], className)}
    >
      {children}
    </Badge>
  );
}

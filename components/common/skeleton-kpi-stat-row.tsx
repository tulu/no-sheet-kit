"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Three placeholder cards matching the Loans summary KPI row layout. */
export function SkeletonKpiStatRow({ className }: { className?: string }) {
  return (
    <div className={cn("mb-6 grid gap-4 sm:grid-cols-3", className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`kpi-skel-${i}`}
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-20 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

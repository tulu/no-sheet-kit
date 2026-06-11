"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TrackerViewMode } from "@/lib/tracker/schema";

export type TrackerViewSkeletonProps = {
  viewMode: TrackerViewMode;
};

function TrackerSkeletonGrid() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, sectionIdx) => (
        <section key={`tracker-skel-section-${sectionIdx}`}>
          <Skeleton className="mb-2 h-4 w-36" />
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: sectionIdx === 0 ? 4 : 2 }).map((__, idx) => (
              <li key={`tracker-skel-card-${sectionIdx}-${idx}`}>
                <Card className="h-full overflow-hidden border border-border/70 gap-0 py-0 pb-4">
                  <div className="h-1 w-full shrink-0 bg-blue-500" aria-hidden />
                  <CardHeader className="gap-2 rounded-none px-4 pb-0 pt-3">
                    <div className="flex items-start justify-between gap-3">
                      <Skeleton className="h-5 min-w-0 flex-1 max-w-full" />
                      <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 px-4 pb-0 pt-1.5">
                    <Skeleton className="h-3 w-2/3 max-w-full" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TrackerSkeletonList() {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2">{t.tracker.table.date}</TableHead>
            <TableHead className="px-3 py-2">{t.tracker.table.outcome}</TableHead>
            <TableHead className="px-3 py-2">{t.tracker.table.start}</TableHead>
            <TableHead className="px-3 py-2">{t.tracker.table.end}</TableHead>
            <TableHead className="px-3 py-2">{t.tracker.table.notes}</TableHead>
            <TableHead className="w-10 px-2 py-2" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <TableRow key={`tracker-skel-row-${idx}`}>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-full max-w-[200px]" />
              </TableCell>
              <TableCell className="px-2 py-2">
                <Skeleton className="mx-auto h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TrackerSkeletonCalendar() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, idx) => (
          <Skeleton key={`tracker-skel-cal-${idx}`} className="aspect-square rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function TrackerViewSkeleton({ viewMode }: TrackerViewSkeletonProps) {
  switch (viewMode) {
    case "grid":
      return <TrackerSkeletonGrid />;
    case "list":
      return <TrackerSkeletonList />;
    case "calendar":
      return <TrackerSkeletonCalendar />;
  }
}

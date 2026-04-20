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
import type { DomainsViewMode } from "@/lib/domains/schema";

export type DomainsViewSkeletonProps = {
  viewMode: DomainsViewMode;
};

function DomainsSkeletonGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <li key={`domains-skel-card-${idx}`}>
          <Card className="h-full border border-border/70 py-4">
            <CardHeader className="gap-2 px-4 pb-2 pt-0">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
              </div>
              <Skeleton className="h-5 w-4/5 max-w-full" />
              <Skeleton className="h-3.5 w-1/2 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-0 pt-0">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3 max-w-full" />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function DomainsSkeletonList() {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.domains.fields.domainName}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.domains.fields.registrar}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.domains.fields.expiresOn}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{t.domains.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, idx) => (
            <TableRow key={`domains-skel-row-${idx}`} className="hover:bg-muted/20">
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-40 max-w-full" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-2 py-1">
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DomainsSkeletonCalendar() {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, idx) => (
          <Skeleton key={`domains-cal-${idx}`} className="aspect-square rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function DomainsViewSkeleton({ viewMode }: DomainsViewSkeletonProps) {
  switch (viewMode) {
    case "grid":
      return <DomainsSkeletonGrid />;
    case "list":
      return <DomainsSkeletonList />;
    case "calendar":
      return <DomainsSkeletonCalendar />;
    default:
      return null;
  }
}

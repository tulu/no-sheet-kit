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
import { SkeletonKpiStatRow } from "@/components/common/skeleton-kpi-stat-row";
import type { LoansViewMode } from "@/lib/loans/schema";

export type LoansViewSkeletonProps = {
  viewMode: LoansViewMode;
};

function LoansSkeletonGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <li key={`loans-skel-card-${idx}`}>
          <Card className="h-full border border-border/70 py-4">
            <CardHeader className="gap-2 px-4 pb-2 pt-0">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
              </div>
              <Skeleton className="h-6 w-3/4 max-w-full" />
              <Skeleton className="h-4 w-1/2 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-0 pt-0">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-2/3 max-w-full" />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function LoansSkeletonList() {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.loans.fields.counterparty}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.loans.fields.currency}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.loans.fields.amount}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{t.loans.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, idx) => (
            <TableRow key={`loans-skel-row-${idx}`} className="hover:bg-muted/20">
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-36 max-w-full" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-20" />
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

export function LoansViewSkeleton({ viewMode }: LoansViewSkeletonProps) {
  return (
    <>
      <SkeletonKpiStatRow />
      {viewMode === "grid" ? <LoansSkeletonGrid /> : viewMode === "list" ? <LoansSkeletonList /> : null}
    </>
  );
}

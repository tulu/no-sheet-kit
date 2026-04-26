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
import type { CollectionsViewMode } from "@/lib/collections/schema";

export type CollectionsViewSkeletonProps = {
  viewMode: CollectionsViewMode;
  showPrice: boolean;
  showLink: boolean;
};

function CollectionsSkeletonGrid({ showLink }: { showLink: boolean }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <li key={`collections-skel-card-${idx}`}>
          <Card className="h-full border border-border/70 gap-0 py-0 pb-4">
            <CardHeader className="gap-2 rounded-none px-4 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 min-w-0 flex-1 max-w-full" />
                    {showLink ? <Skeleton className="size-7 shrink-0 rounded-md" /> : null}
                  </div>
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
                <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-0 pt-3">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-11/12 max-w-full" />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function CollectionsSkeletonList({ showPrice, showLink }: { showPrice: boolean; showLink: boolean }) {
  const { t } = useI18n();

  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.collections.table.name}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.collections.table.status}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.collections.table.notes}
            </TableHead>
            {showPrice ? (
              <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.collections.table.price}
              </TableHead>
            ) : null}
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.collections.table.related}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{t.collections.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, idx) => (
            <TableRow key={`collections-skel-row-${idx}`} className="hover:bg-muted/20">
              <TableCell className="max-w-[280px] px-3 py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 min-w-0 flex-1 max-w-full" />
                  {showLink ? <Skeleton className="size-7 shrink-0 rounded-md" /> : null}
                </div>
              </TableCell>
              <TableCell className="px-3 py-2 align-middle">
                <Skeleton className="h-6 w-20 rounded-md" />
              </TableCell>
              <TableCell className="max-w-[220px] px-3 py-2">
                <Skeleton className="h-4 w-full max-w-[180px]" />
              </TableCell>
              {showPrice ? (
                <TableCell className="px-3 py-2 align-middle">
                  <Skeleton className="h-4 w-16 rounded-sm" />
                </TableCell>
              ) : null}
              <TableCell className="max-w-[200px] px-3 py-2">
                <Skeleton className="h-3 w-24 rounded-sm" />
              </TableCell>
              <TableCell className="px-2 py-1 align-middle">
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CollectionsViewSkeleton({
  viewMode,
  showPrice,
  showLink,
}: CollectionsViewSkeletonProps) {
  switch (viewMode) {
    case "grid":
      return <CollectionsSkeletonGrid showLink={showLink} />;
    case "list":
      return <CollectionsSkeletonList showPrice={showPrice} showLink={showLink} />;
  }
}

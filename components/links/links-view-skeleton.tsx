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
import type { LinksViewMode } from "@/lib/links/schema";

const LINK_CARD_HERO_H = "h-36";

export type LinksViewSkeletonProps = {
  viewMode: LinksViewMode | null;
};

function LinksSkeletonGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <li key={`links-skel-card-${idx}`}>
          <Card className="h-full border border-border/70 gap-0 py-0 pb-4">
            <Skeleton className={`w-full rounded-none ${LINK_CARD_HERO_H}`} />
            <CardHeader className="gap-2 rounded-none px-4 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <Skeleton className="size-8 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-5/6 max-w-full" />
                    <Skeleton className="h-4 w-2/3 max-w-full" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-0 pt-3">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-11/12 max-w-full" />
              <Skeleton className="h-3 w-2/3 max-w-full" />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function LinksSkeletonList() {
  const { t } = useI18n();

  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.links.table.title}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.links.table.site}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.links.table.addedOn}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{t.links.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, idx) => (
            <TableRow key={`links-skel-row-${idx}`} className="hover:bg-muted/20">
              <TableCell className="max-w-[280px] px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Skeleton className="size-6 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 max-w-full" />
                    <Skeleton className="h-3 w-full max-w-[220px]" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3 py-2 align-middle">
                <Skeleton className="h-4 w-24 rounded-sm" />
              </TableCell>
              <TableCell className="px-3 py-2 align-middle">
                <Skeleton className="h-4 w-20 rounded-sm" />
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

export function LinksViewSkeleton({ viewMode }: LinksViewSkeletonProps) {
  switch (viewMode) {
    case "grid":
      return <LinksSkeletonGrid />;
    case "list":
      return <LinksSkeletonList />;
    default:
      return null;
  }
}

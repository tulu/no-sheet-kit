"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TasksViewMode } from "@/lib/tasks/schema";
import { useI18n } from "@/components/providers/i18n-provider";

export type TasksViewSkeletonProps = {
  viewMode: TasksViewMode;
};

function KanbanSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, col) => (
        <div key={`sk-col-${col}`} className="rounded-lg border border-border bg-muted/20 p-3">
          <Skeleton className="mb-3 h-5 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={`sk-card-${col}-${i}`} className="border border-border/70 py-3">
                <CardHeader className="gap-2 px-3 py-0">
                  <Skeleton className="h-4 w-3/4 max-w-full" />
                  <Skeleton className="h-3 w-20" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-border">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.tasks.table.title}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.tasks.table.status}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.tasks.table.dueDate}
            </TableHead>
            <TableHead className="w-10 px-2 py-2" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={`sk-r-${i}`} className="hover:bg-muted/20">
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-48 max-w-full" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Skeleton className="h-4 w-28" />
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

export function TasksViewSkeleton({ viewMode }: TasksViewSkeletonProps) {
  switch (viewMode) {
    case "kanban":
      return <KanbanSkeleton />;
    case "list":
      return <ListSkeleton />;
    default:
      return null;
  }
}

"use client";

import Link from "next/link";
import { LayoutDashboard, ChevronRight, CalendarCheck2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { NSKSpace, NSKTask, NSKTasksSchema } from "@/lib/tasks/schema";
import {
  activeTasksInUserSpaces,
  completionRatio,
  countByStatus,
  isTaskPastDue,
  overdueActiveTasks,
  sortSpaces,
  tasksDueWithinDays,
  userVisibleTasksSchema,
} from "@/lib/tasks/tasks-helpers";

export type TasksDashboardProps = {
  schema: NSKTasksSchema;
};

export function TasksDashboard({ schema }: TasksDashboardProps) {
  const { t } = useI18n();
  const visible = userVisibleTasksSchema(schema);
  if (visible.spaces.length === 0) return null;
  const spaces = sortSpaces(visible.spaces);
  const active = activeTasksInUserSpaces(schema);
  const byStatus = countByStatus(active);
  const ratio = completionRatio(active);
  const dueSoon = tasksDueWithinDays(visible.tasks, new Date(), 30).filter((x) => !x.archived);
  const pastDue = overdueActiveTasks(visible.tasks, new Date()).sort(
    (a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? "") || a.title.localeCompare(b.title)
  );
  const pct =
    ratio == null ? "—" : `${Math.round(ratio * 100)}%`;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <LayoutDashboard className="size-5 shrink-0" aria-hidden />
        <h2 className="text-lg font-semibold text-foreground">{t.tasks.dashboard.title}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.tasks.dashboard.spacesCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{spaces.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.tasks.kpi.todo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{byStatus.todo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.tasks.kpi.inProgress}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{byStatus.in_progress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.tasks.kpi.done}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{byStatus.done}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="min-h-0">
          <CardHeader>
            <CardTitle className="text-base">{t.tasks.dashboard.completion}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.tasks.dashboard.completionHint}</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{pct}</p>
          </CardContent>
        </Card>

        <Card className="min-h-0">
          <CardHeader>
            <CardTitle className="text-base">{t.tasks.dashboard.dueNext30}</CardTitle>
          </CardHeader>
          <CardContent>
            {dueSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.tasks.dashboard.noDueSoon}</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {dueSoon.map((task) => (
                  <DashboardTaskRow
                    key={task.id}
                    task={task}
                    spaceName={visible.spaces.find((s) => s.id === task.space_id)?.name ?? null}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-0">
          <CardHeader>
            <CardTitle className="text-base">{t.tasks.dashboard.pastDue}</CardTitle>
          </CardHeader>
          <CardContent>
            {pastDue.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.tasks.dashboard.noPastDue}</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {pastDue.map((task) => (
                  <DashboardTaskRow
                    key={task.id}
                    task={task}
                    spaceName={visible.spaces.find((s) => s.id === task.space_id)?.name ?? null}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t.tasks.sidebarTitle}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {spaces.map((space) => (
            <li key={space.id}>
              <SpaceShortcutCard space={space} schema={visible} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function tasksBoardHref(spaceId: string, highlightTaskId?: string) {
  const p = new URLSearchParams({ space: spaceId });
  if (highlightTaskId) p.set("highlight", highlightTaskId);
  return `/apps/tasks?${p.toString()}`;
}

function DashboardTaskRow({ task, spaceName }: { task: NSKTask; spaceName: string | null }) {
  return (
    <li>
      <Link
        href={tasksBoardHref(task.space_id, task.id)}
        className="block w-full py-2.5 text-left transition-colors hover:bg-muted/40"
      >
        <span className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline">
          <span>{task.title}</span>
          {task.google_calendar_event_id ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/12 p-1 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck2 className="size-3.5" aria-hidden />
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          <span className={cn(task.due_date && isTaskPastDue(task) && "font-medium text-destructive")}>
            {task.due_date ?? "—"}
          </span>
          {spaceName ? <> · {spaceName}</> : null}
        </span>
      </Link>
    </li>
  );
}

function SpaceShortcutCard({ space, schema }: { space: NSKSpace; schema: NSKTasksSchema }) {
  const { t } = useI18n();
  const active = schema.tasks.filter((x) => x.space_id === space.id && !x.archived);
  const by = countByStatus(active);

  return (
    <Card className="h-full border border-border/70 transition-colors hover:bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{space.name}</CardTitle>
        <Link
          href={tasksBoardHref(space.id)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 gap-1")}
        >
          {t.tasks.dashboard.openSpace}
          <ChevronRight className="ml-1 size-4" aria-hidden />
        </Link>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        <p>
          {t.tasks.kpi.todo}: {by.todo} · {t.tasks.kpi.inProgress}: {by.in_progress} · {t.tasks.kpi.done}:{" "}
          {by.done}
        </p>
      </CardContent>
    </Card>
  );
}

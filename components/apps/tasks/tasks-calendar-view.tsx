"use client";

import { MonthGridCalendar } from "@/components/common/month-grid-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n/types";
import type { NSKTask, TaskStatus } from "@/lib/tasks/schema";
import { tasksOnCalendarDay } from "@/lib/tasks/tasks-helpers";
import { cn } from "@/lib/utils";

export type TasksCalendarViewProps = {
  locale: Locale;
  tasks: NSKTask[];
  calendarMonth: Date;
  onCalendarMonthChange: (month: Date) => void;
  statusLabel: Record<TaskStatus, string>;
  onEdit: (task: NSKTask) => void;
  onShowListView?: () => void;
};

export function TasksCalendarView({
  locale,
  tasks,
  calendarMonth,
  onCalendarMonthChange,
  statusLabel,
  onEdit,
  onShowListView,
}: TasksCalendarViewProps) {
  const { t } = useI18n();
  const withoutDueCount = tasks.filter((task) => !task.due_date).length;

  return (
    <div className="space-y-4">
      <MonthGridCalendar<NSKTask>
        locale={locale}
        month={calendarMonth}
        onMonthChange={onCalendarMonthChange}
        regionAriaLabel={t.tasks.calendarMonthNav}
        prevMonthAriaLabel={t.tasks.calendarPrevMonth}
        nextMonthAriaLabel={t.tasks.calendarNextMonth}
        getItemsForDay={(day) => tasksOnCalendarDay(tasks, day)}
        getItemKey={(task) => task.id}
        renderItem={(task) => (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className={cn(
              "flex w-full max-w-full min-w-0 items-center gap-1 rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-left text-[11px] leading-tight transition-colors hover:bg-muted/60 sm:text-xs",
              task.archived && "opacity-70"
            )}
            title={task.title}
          >
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">{task.title}</span>
            <Badge variant="outline" className="h-4 shrink-0 px-1 text-[10px]">
              {statusLabel[task.status]}
            </Badge>
          </button>
        )}
      />
      {withoutDueCount > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t.tasks.calendarNoDueDateHint.replace("{count}", String(withoutDueCount))}
          {onShowListView ? (
            <>
              {" "}
              <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={onShowListView}>
                {t.tasks.calendarViewListLink}
              </Button>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

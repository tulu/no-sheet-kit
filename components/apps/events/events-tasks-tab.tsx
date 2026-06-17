"use client";

import { useState } from "react";
import { Calendar, LayoutGrid, List, ListTodo } from "lucide-react";
import { startOfMonth } from "date-fns";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
import { ListSearchEmptyState } from "@/components/common/list-search-empty";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/components/providers/i18n-provider";
import { filterItemsBySearch } from "@/lib/apps/filter-items-by-search";
import { readAppViewBundlePreference, persistAppViewBundle } from "@/lib/apps/view-persistence";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import {
  EVENTS_TASKS_VIEW_MODES,
  type EventsTasksViewMode,
} from "@/lib/events/schema";
import type { NSKTask, TaskStatus } from "@/lib/tasks/schema";
import { taskMatchesSearch } from "@/lib/tasks/tasks-helpers";
import { TasksKanbanDndProvider } from "@/components/apps/tasks/tasks-kanban-dnd-provider";
import { TasksView } from "@/components/apps/tasks/tasks-view";

type EventsTasksTabProps = {
  spaceId: string;
  tasks: NSKTask[];
  allTasks: NSKTask[];
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  calendarMonth: Date;
  onCalendarMonthChange: (month: Date) => void;
  onTasksReplace: (tasks: NSKTask[]) => void;
  onAddTask: () => void;
  onEditTask: (task: NSKTask) => void;
  onDeleteTask: (task: NSKTask) => void;
  onArchive: (task: NSKTask) => void;
  onUnarchive: (task: NSKTask) => void;
  onArchiveAllDone: () => void;
};

export function EventsTasksTab({
  spaceId,
  tasks,
  allTasks,
  showArchived,
  onShowArchivedChange,
  calendarMonth,
  onCalendarMonthChange,
  onTasksReplace,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onArchive,
  onUnarchive,
  onArchiveAllDone,
}: EventsTasksTabProps) {
  const { t, locale } = useI18n();
  const [viewMode, setViewMode] = useState<EventsTasksViewMode>(() => {
    const stored = readAppViewBundlePreference("events_tasks", EVENTS_TASKS_VIEW_MODES);
    return stored ?? "kanban";
  });
  const [taskSearch, setTaskSearch] = useState("");

  const filteredTasks = filterItemsBySearch(tasks, taskSearch, taskMatchesSearch);

  const columnTitles = {
    todo: t.events.tasks.columns.todo,
    inProgress: t.events.tasks.columns.inProgress,
    done: t.events.tasks.columns.done,
  };

  const statusLabel: Record<TaskStatus, string> = {
    todo: t.events.tasks.statusLabels.todo,
    in_progress: t.events.tasks.statusLabels.in_progress,
    done: t.events.tasks.statusLabels.done,
  };

  const cardLabels = {
    edit: t.events.tasks.edit,
    delete: t.events.tasks.deleteTask,
    archive: t.events.tasks.archive,
    unarchive: t.events.tasks.unarchive,
    cardActionsMenu: t.events.tasks.cardActionsMenu,
  };

  const listLabels = {
    ...cardLabels,
    tableTitle: t.events.tasks.table.title,
    tableStatus: t.events.tasks.table.status,
    tableDue: t.events.tasks.table.dueDate,
    tableComments: t.events.tasks.table.comments,
    tableArchived: t.events.tasks.table.archived,
  };

  function handleViewModeChange(next: EventsTasksViewMode) {
    setViewMode(next);
    persistAppViewBundle("events_tasks", next);
    if (next === "calendar") {
      onCalendarMonthChange(startOfMonth(new Date()));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="shrink-0">
        <AppListToolbar<EventsTasksViewMode>
          totalLabel={t.events.tasks.totalLabel.replace("{count}", String(filteredTasks.length))}
          viewModes={[
            { id: "kanban", icon: LayoutGrid, ariaLabel: t.events.tasks.viewKanban },
            { id: "list", icon: List, ariaLabel: t.events.tasks.viewList },
            { id: "calendar", icon: Calendar, ariaLabel: t.events.tasks.viewCalendar },
          ]}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          addButtonLabel={t.events.tasks.addTask}
          onAdd={onAddTask}
          search={{
            value: taskSearch,
            onChange: setTaskSearch,
            placeholder: t.events.tasks.searchPlaceholder,
            "aria-label": t.events.tasks.searchAriaLabel,
          }}
          searchTrailing={
            <>
              <Switch
                id="events-tasks-archived"
                checked={showArchived}
                onCheckedChange={onShowArchivedChange}
              />
              <Label htmlFor="events-tasks-archived" className="text-sm text-muted-foreground whitespace-nowrap">
                {showArchived ? t.events.tasks.hideArchived : t.events.tasks.showArchived}
              </Label>
            </>
          }
        />
      </div>

      {tasks.length === 0 ? (
        <Empty className="border border-border p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListTodo />
            </EmptyMedia>
            <EmptyTitle className="text-xl font-semibold text-foreground">
              {t.events.tasks.emptyTitle}
            </EmptyTitle>
            <EmptyDescription>{t.events.tasks.emptyBody}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={onAddTask}>
              {t.events.tasks.addTask}
            </Button>
          </EmptyContent>
        </Empty>
      ) : filteredTasks.length === 0 ? (
        <ListSearchEmptyState
          labels={{
            title: t.events.tasks.emptySearchTitle,
            body: t.events.tasks.emptySearchBody,
            clear: t.events.tasks.searchClear,
          }}
          onClear={() => setTaskSearch("")}
        />
      ) : (
        <TasksKanbanDndProvider
          spaceId={spaceId}
          allTasks={allTasks}
          onTasksReplace={onTasksReplace}
          onMovedToSpace={() => {}}
          cardLabels={cardLabels}
        >
          <TasksView
            viewMode={viewMode}
            spaceId={spaceId}
            tasks={filteredTasks}
            allTasks={allTasks}
            onTasksReplace={onTasksReplace}
            columnTitles={columnTitles}
            cardLabels={cardLabels}
            listLabels={listLabels}
            statusLabel={statusLabel}
            localeTag={getIntlLocaleTag(locale)}
            locale={locale}
            calendarMonth={calendarMonth}
            onCalendarMonthChange={onCalendarMonthChange}
            onSwitchToListView={() => handleViewModeChange("list")}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onArchiveAllDone={onArchiveAllDone}
            doneColumnMenuLabels={{
              menuAriaLabel: t.events.tasks.doneColumnMenuAria,
              archiveAllLabel: t.events.tasks.archiveAll,
            }}
          />
        </TasksKanbanDndProvider>
      )}
    </div>
  );
}

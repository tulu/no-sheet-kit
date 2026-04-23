"use client";

import { Folder, LayoutDashboard, LayoutGrid, List, Settings2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
import { ConfirmDeleteAlertDialog } from "@/components/common/confirm-delete-alert-dialog";
import {
  FilterSidebarDesktopAside,
  FilterSidebarMobileBar,
  FilterSidebarMobileSheet,
  type FilterSidebarItem,
} from "@/components/common/filter-sidebar";
import { ListSearchEmptyState } from "@/components/common/list-search-empty";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useAppLocalHydration } from "@/lib/apps/use-app-local-hydration";
import { filterItemsBySearch } from "@/lib/apps/filter-items-by-search";
import { persistAppViewBundle } from "@/lib/apps/view-persistence";
import {
  appCrudToast,
  appTasksCommentToast,
  appTasksSpaceToast,
} from "@/lib/app-toasts";
import {
  createEmptyNSKTasksSchema,
  TASKS_DASHBOARD_NAV_ID,
  TASKS_VIEW_MODES,
  type NSKSpace,
  type NSKTask,
  type NSKTasksSchema,
  type TasksViewMode,
} from "@/lib/tasks/schema";
import { readNSKTasksStorage, writeNSKTasksStorage } from "@/lib/tasks/storage";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import {
  nextOrderForColumn,
  sortSpaces,
  taskMatchesSearch,
  tasksInSpace,
} from "@/lib/tasks/tasks-helpers";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import { AddSpaceSheet } from "./add-space-sheet";
import { AddTaskSheet } from "./add-task-sheet";
import { DeleteSpaceWithTasksDialog } from "./delete-space-with-tasks-dialog";
import { ManageSpacesSheet } from "./manage-spaces-sheet";
import { TasksDashboard } from "./tasks-dashboard";
import { TasksView } from "./tasks-view";
import { TasksViewSkeleton } from "./tasks-view-skeleton";

type NavId = typeof TASKS_DASHBOARD_NAV_ID | string;

export function TasksAppPage() {
  const sessionSuffix = useSessionStorageSuffix();
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState<NavId>(TASKS_DASHBOARD_NAV_ID);
  /** Brief pulse + scroll after `?highlight=` from dashboard (cleared from URL immediately). */
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TasksViewMode>("kanban");
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [store, setStore] = useState<NSKTasksSchema>(createEmptyNSKTasksSchema);
  const [taskSearch, setTaskSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [spaceSheetOpen, setSpaceSheetOpen] = useState(false);
  const [spaceSheetInitialName, setSpaceSheetInitialName] = useState<string | undefined>(undefined);
  const [reopenManageAfterSpaceSheet, setReopenManageAfterSpaceSheet] = useState(false);
  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<NSKSpace | null>(null);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<NSKTask | null>(null);

  const [taskPendingDelete, setTaskPendingDelete] = useState<NSKTask | null>(null);
  const [spacePendingDelete, setSpacePendingDelete] = useState<NSKSpace | null>(null);
  const [spaceDeleteWithTasks, setSpaceDeleteWithTasks] = useState<NSKSpace | null>(null);
  const [commentPendingDelete, setCommentPendingDelete] = useState<{
    taskId: string;
    commentId: string;
  } | null>(null);

  useAppLocalHydration(() => readNSKTasksStorage(sessionSuffix), setStore, setIsStoreHydrated, {
    appViewKey: "tasks",
    validModes: TASKS_VIEW_MODES,
    defaultView: "kanban",
    setViewMode,
  });

  const syncTasksUrlToNav = useCallback(
    (next: NavId) => {
      const p = new URLSearchParams(searchParams.toString());
      p.delete("highlight");
      if (next === TASKS_DASHBOARD_NAV_ID) {
        p.delete("space");
      } else {
        p.set("space", next);
      }
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleNavChange = useCallback(
    (next: NavId) => {
      setActiveNav(next);
      setHighlightTaskId(null);
      syncTasksUrlToNav(next);
    },
    [syncTasksUrlToNav]
  );

  useEffect(() => {
    if (!isStoreHydrated) return;
    const raf = requestAnimationFrame(() => {
      const highlight = searchParams.get("highlight");
      const space = searchParams.get("space");

      if (highlight) {
        const task = store.tasks.find((t) => t.id === highlight);
        if (task && store.spaces.some((s) => s.id === task.space_id)) {
          setActiveNav(task.space_id);
          setHighlightTaskId(task.id);
          const p = new URLSearchParams(searchParams.toString());
          p.delete("highlight");
          p.set("space", task.space_id);
          const qs = p.toString();
          router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
          return;
        }
      }

      if (space && store.spaces.some((s) => s.id === space)) {
        setActiveNav(space);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [isStoreHydrated, searchParams, store.tasks, store.spaces, router, pathname]);

  useEffect(() => {
    if (!highlightTaskId || !isStoreHydrated) return;
    const raf = requestAnimationFrame(() => {
      const sel = `[data-task-id="${CSS.escape(highlightTaskId)}"]`;
      document.querySelector(sel)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    const tid = window.setTimeout(() => setHighlightTaskId(null), 2400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(tid);
    };
  }, [highlightTaskId, isStoreHydrated]);

  const commit = useCallback(
    (updater: (prev: NSKTasksSchema) => NSKTasksSchema) => {
      setStore((prev) => {
        const next = updater(prev);
        writeNSKTasksStorage(sessionSuffix, next);
        return next;
      });
    },
    [sessionSuffix]
  );

  /** Keep task sheet in sync with store (comments, status from Kanban, etc.). */
  const editingTaskLive = useMemo(() => {
    if (!editingTask) return null;
    return store.tasks.find((t) => t.id === editingTask.id) ?? editingTask;
  }, [editingTask, store.tasks]);

  const spacesSorted = useMemo(() => sortSpaces(store.spaces), [store.spaces]);

  const sidebarItems: FilterSidebarItem<NavId>[] = useMemo(() => {
    const rows: FilterSidebarItem<NavId>[] = [
      {
        id: TASKS_DASHBOARD_NAV_ID,
        label: t.tasks.dashboardNav,
        icon: LayoutDashboard,
        count: 0,
        hideCount: true,
        tone: "accent",
      },
    ];
    for (const sp of spacesSorted) {
      const c = store.tasks.filter((x) => x.space_id === sp.id && (!showArchived ? !x.archived : true)).length;
      rows.push({
        id: sp.id,
        label: sp.name,
        icon: Folder,
        count: c,
        dividerBefore: rows.length === 1,
      });
    }
    return rows;
  }, [store.tasks, spacesSorted, t.tasks.dashboardNav, showArchived]);

  const activeSpaceId = activeNav === TASKS_DASHBOARD_NAV_ID ? null : activeNav;
  const spaceTasksRaw = useMemo(() => {
    if (!activeSpaceId) return [];
    return tasksInSpace(store.tasks, activeSpaceId, { includeArchived: showArchived });
  }, [store.tasks, activeSpaceId, showArchived]);

  const searchFilteredTasks = useMemo(
    () => filterItemsBySearch(spaceTasksRaw, taskSearch, taskMatchesSearch),
    [spaceTasksRaw, taskSearch]
  );

  function handleViewModeChange(next: TasksViewMode) {
    setViewMode(next);
    persistAppViewBundle("tasks", next);
  }

  function openCreateTask() {
    if (!activeSpaceId) return;
    setEditingTask(null);
    setTaskSheetOpen(true);
  }

  function openEditTask(task: NSKTask) {
    setEditingTask(task);
    setTaskSheetOpen(true);
  }

  function openCreateSpace(initialName?: string) {
    setEditingSpace(null);
    setSpaceSheetInitialName(initialName);
    setSpaceSheetOpen(true);
  }

  function openCreateSpaceFromDashboard() {
    setReopenManageAfterSpaceSheet(false);
    openCreateSpace(t.tasks.defaultSpaceName);
  }

  function openEditSpace(space: NSKSpace) {
    setEditingSpace(space);
    setSpaceSheetInitialName(undefined);
    setSpaceSheetOpen(true);
  }

  function closeSpaceSheet() {
    setSpaceSheetOpen(false);
    setEditingSpace(null);
    setSpaceSheetInitialName(undefined);
    if (reopenManageAfterSpaceSheet) {
      setReopenManageAfterSpaceSheet(false);
      setManageSheetOpen(true);
    }
  }

  function openManageSpaces() {
    setManageSheetOpen(true);
  }

  function openAddSpaceFromManage() {
    setReopenManageAfterSpaceSheet(true);
    setManageSheetOpen(false);
    openCreateSpace(t.tasks.defaultSpaceName);
  }

  function openRenameSpaceFromManage(space: NSKSpace) {
    setReopenManageAfterSpaceSheet(true);
    setManageSheetOpen(false);
    openEditSpace(space);
  }

  function requestDeleteSpace(space: NSKSpace) {
    const taskCount = store.tasks.filter((x) => x.space_id === space.id).length;
    if (taskCount === 0) {
      setSpacePendingDelete(space);
      return;
    }
    setSpaceDeleteWithTasks(space);
  }

  function dismissSpaceSheetAfterSave() {
    setSpaceSheetOpen(false);
    setEditingSpace(null);
    setSpaceSheetInitialName(undefined);
    setReopenManageAfterSpaceSheet(false);
  }

  function handleSpaceSubmit(name: string) {
    const now = new Date().toISOString();
    if (editingSpace) {
      commit((prev) => ({
        ...prev,
        spaces: prev.spaces.map((s) =>
          s.id === editingSpace.id ? { ...s, name, updated_at: now } : s
        ),
      }));
      appTasksSpaceToast(t, "updated");
      dismissSpaceSheetAfterSave();
      return;
    }
    commit((prev) => {
      const maxOrder = Math.max(-1, ...prev.spaces.map((s) => s.order));
      const id = crypto.randomUUID();
      return {
        ...prev,
        spaces: [...prev.spaces, { id, name, order: maxOrder + 1, created_at: now, updated_at: now }],
      };
    });
    appTasksSpaceToast(t, "created");
    dismissSpaceSheetAfterSave();
  }

  function confirmDeleteSpace() {
    if (!spacePendingDelete) return;
    const sid = spacePendingDelete.id;
    commit((prev) => ({
      ...prev,
      spaces: prev.spaces.filter((s) => s.id !== sid),
      tasks: prev.tasks.filter((x) => x.space_id !== sid),
    }));
    appTasksSpaceToast(t, "deleted");
    if (activeNav === sid) {
      setActiveNav(TASKS_DASHBOARD_NAV_ID);
      setHighlightTaskId(null);
      syncTasksUrlToNav(TASKS_DASHBOARD_NAV_ID);
    }
    setSpacePendingDelete(null);
  }

  function confirmDeleteSpaceMoveTasks(targetSpaceId: string) {
    if (!spaceDeleteWithTasks) return;
    const sid = spaceDeleteWithTasks.id;
    const now = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      spaces: prev.spaces.filter((s) => s.id !== sid),
      tasks: prev.tasks.map((x) =>
        x.space_id === sid ? { ...x, space_id: targetSpaceId, updated_at: now } : x
      ),
    }));
    appTasksSpaceToast(t, "deleted");
    if (activeNav === sid) {
      setActiveNav(TASKS_DASHBOARD_NAV_ID);
      setHighlightTaskId(null);
      syncTasksUrlToNav(TASKS_DASHBOARD_NAV_ID);
    }
    setSpaceDeleteWithTasks(null);
    setManageSheetOpen(false);
  }

  function confirmDeleteSpaceAndAllTasks() {
    if (!spaceDeleteWithTasks) return;
    const sid = spaceDeleteWithTasks.id;
    commit((prev) => ({
      ...prev,
      spaces: prev.spaces.filter((s) => s.id !== sid),
      tasks: prev.tasks.filter((x) => x.space_id !== sid),
    }));
    appTasksSpaceToast(t, "deleted");
    if (activeNav === sid) {
      setActiveNav(TASKS_DASHBOARD_NAV_ID);
      setHighlightTaskId(null);
      syncTasksUrlToNav(TASKS_DASHBOARD_NAV_ID);
    }
    setSpaceDeleteWithTasks(null);
    setManageSheetOpen(false);
  }

  function handleSaveTaskFromForm(values: { title: string; description: string; due_date: string }) {
    if (!activeSpaceId) return;
    const now = new Date().toISOString();
    if (editingTask) {
      const current = store.tasks.find((x) => x.id === editingTask.id) ?? editingTask;
      const status = current.status;
      commit((prev) => ({
        ...prev,
        tasks: prev.tasks.map((x) =>
          x.id === editingTask.id
            ? {
                ...x,
                title: values.title,
                description: values.description || undefined,
                due_date: values.due_date || undefined,
                status,
                updated_at: now,
              }
            : x
        ),
      }));
      appCrudToast(t, "tasks", "updated");
      return;
    }
    commit((prev) => {
      const order = nextOrderForColumn(prev.tasks, activeSpaceId, "todo");
      const id = crypto.randomUUID();
      const row: NSKTask = {
        id,
        space_id: activeSpaceId,
        title: values.title,
        description: values.description || undefined,
        due_date: values.due_date || undefined,
        status: "todo",
        archived: false,
        order,
        created_at: now,
        updated_at: now,
        comments: [],
      };
      return { ...prev, tasks: [...prev.tasks, row] };
    });
    appCrudToast(t, "tasks", "created");
  }

  function handleAddComment(taskId: string, body: string) {
    const now = new Date().toISOString();
    const cid = crypto.randomUUID();
    commit((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) =>
        x.id === taskId
          ? {
              ...x,
              updated_at: now,
              comments: [...x.comments, { id: cid, body, created_at: now, updated_at: now }],
            }
          : x
      ),
    }));
    appTasksCommentToast(t, "created");
  }

  function handleUpdateComment(taskId: string, commentId: string, body: string) {
    const now = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) =>
        x.id === taskId
          ? {
              ...x,
              updated_at: now,
              comments: x.comments.map((c) =>
                c.id === commentId ? { ...c, body, updated_at: now } : c
              ),
            }
          : x
      ),
    }));
    appTasksCommentToast(t, "updated");
  }

  function confirmDeleteComment() {
    if (!commentPendingDelete) return;
    const { taskId, commentId } = commentPendingDelete;
    const now = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) =>
        x.id === taskId
          ? {
              ...x,
              updated_at: now,
              comments: x.comments.filter((c) => c.id !== commentId),
            }
          : x
      ),
    }));
    appTasksCommentToast(t, "deleted");
    setCommentPendingDelete(null);
  }

  function handleArchive(task: NSKTask) {
    if (task.status !== "done" || task.archived) return;
    const now = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) => (x.id === task.id ? { ...x, archived: true, updated_at: now } : x)),
    }));
  }

  function handleUnarchive(task: NSKTask) {
    const now = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) => (x.id === task.id ? { ...x, archived: false, updated_at: now } : x)),
    }));
  }

  function confirmDeleteTask() {
    if (!taskPendingDelete) return;
    commit((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((x) => x.id !== taskPendingDelete.id),
    }));
    appCrudToast(t, "tasks", "deleted");
    setTaskPendingDelete(null);
  }

  function handleTasksReplace(nextTasks: NSKTask[]) {
    commit((prev) => ({ ...prev, tasks: nextTasks }));
  }

  const cardLabels = {
    edit: t.tasks.edit,
    delete: t.tasks.delete,
    archive: t.tasks.archive,
    unarchive: t.tasks.unarchive,
    cardActionsMenu: t.tasks.cardActionsMenu,
  };

  const listLabels = {
    ...cardLabels,
    tableTitle: t.tasks.table.title,
    tableStatus: t.tasks.table.status,
    tableDue: t.tasks.table.dueDate,
    tableComments: t.tasks.table.comments,
    tableArchived: t.tasks.table.archived,
  };

  const columnTitles = {
    todo: t.tasks.columns.todo,
    inProgress: t.tasks.columns.inProgress,
    done: t.tasks.columns.done,
  };

  const statusLabel = {
    todo: t.tasks.statusLabels.todo,
    in_progress: t.tasks.statusLabels.in_progress,
    done: t.tasks.statusLabels.done,
  };

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={taskPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setTaskPendingDelete(null);
        }}
        title={t.tasks.deleteTaskTitle}
        description={t.tasks.deleteTaskDescription}
        itemLabel={taskPendingDelete?.title ?? ""}
        cancelLabel={t.tasks.deleteCancel}
        confirmLabel={t.tasks.deleteConfirm}
        onConfirm={confirmDeleteTask}
      />
      <ConfirmDeleteAlertDialog
        open={spacePendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setSpacePendingDelete(null);
        }}
        title={t.tasks.deleteSpaceTitle}
        description={t.tasks.deleteSpaceDescription}
        itemLabel={spacePendingDelete?.name ?? ""}
        cancelLabel={t.tasks.deleteCancel}
        confirmLabel={t.tasks.deleteConfirm}
        onConfirm={confirmDeleteSpace}
      />
      <ConfirmDeleteAlertDialog
        open={commentPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setCommentPendingDelete(null);
        }}
        title={t.tasks.deleteCommentTitle}
        description={t.tasks.deleteCommentDescription}
        itemLabel=" "
        cancelLabel={t.tasks.deleteCancel}
        confirmLabel={t.tasks.deleteConfirm}
        onConfirm={confirmDeleteComment}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <FilterSidebarDesktopAside<NavId>
          title={t.tasks.sidebarTitle}
          items={sidebarItems}
          activeId={activeNav}
          onFilterChange={handleNavChange}
          footer={
            <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={openManageSpaces}>
              <Settings2 className="size-4 shrink-0" aria-hidden />
              {t.tasks.manageSpacesTitle}
            </Button>
          }
        />

        <FilterSidebarMobileSheet<NavId>
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title={t.tasks.sidebarTitle}
          items={sidebarItems}
          activeId={activeNav}
          onFilterChange={handleNavChange}
          footer={
            <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={openManageSpaces}>
              <Settings2 className="size-4 shrink-0" aria-hidden />
              {t.tasks.manageSpacesTitle}
            </Button>
          }
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <FilterSidebarMobileBar
            title={t.tasks.sidebarTitle}
            onOpen={() => setFiltersOpen(true)}
            openButtonAriaLabel={t.tasks.openSpacesNav}
            endSlot={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={openManageSpaces}
                aria-label={t.tasks.manageSpacesTitle}
              >
                <Settings2 className="size-4" aria-hidden />
              </Button>
            }
          />

          {!isStoreHydrated ? (
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-6">
              {activeSpaceId ? (
                <TasksViewSkeleton viewMode={viewMode} />
              ) : (
                <div className="space-y-4">
                  <div className="h-40 animate-pulse rounded-lg bg-muted/40" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
                    <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
                  </div>
                </div>
              )}
            </div>
          ) : activeNav === TASKS_DASHBOARD_NAV_ID ? (
            <div className="min-h-0 min-w-0 flex-1 overflow-auto px-6 py-6">
              {store.spaces.length === 0 ? (
                <Empty className="border border-border p-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Folder />
                    </EmptyMedia>
                    <EmptyTitle className="text-xl font-semibold text-foreground">{t.tasks.dashboardEmptyTitle}</EmptyTitle>
                    <EmptyDescription>{t.tasks.dashboardEmptyBody}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button type="button" onClick={openCreateSpaceFromDashboard}>
                      {t.tasks.dashboardEmptyCta}
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <TasksDashboard schema={store} />
              )}
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-6">
                <div className="shrink-0">
                  <AppListToolbar<TasksViewMode>
                  totalLabel={t.tasks.totalLabel.replace("{count}", String(searchFilteredTasks.length))}
                  viewModes={[
                    { id: "kanban", icon: LayoutGrid, ariaLabel: t.tasks.viewKanban },
                    { id: "list", icon: List, ariaLabel: t.tasks.viewList },
                  ]}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  addButtonLabel={t.tasks.addTask}
                  onAdd={openCreateTask}
                  search={{
                    value: taskSearch,
                    onChange: setTaskSearch,
                    placeholder: t.tasks.searchPlaceholder,
                    "aria-label": t.tasks.searchAriaLabel,
                  }}
                  searchTrailing={
                    <>
                      <Switch id="tasks-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                      <Label htmlFor="tasks-archived" className="text-sm text-muted-foreground whitespace-nowrap">
                        {showArchived ? t.tasks.hideArchived : t.tasks.showArchived}
                      </Label>
                    </>
                  }
                  />
                </div>

                <div
                  className={
                    viewMode === "kanban"
                      ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden"
                      : "min-h-0 flex-1 overflow-y-auto"
                  }
                >
                  {spaceTasksRaw.length === 0 ? (
                    <Empty className="border border-border p-10">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Folder />
                        </EmptyMedia>
                        <EmptyTitle className="text-xl font-semibold text-foreground">
                          {t.tasks.emptySpaceTitle}
                        </EmptyTitle>
                        <EmptyDescription>{t.tasks.emptySpaceBody}</EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button onClick={openCreateTask}>{t.tasks.addTask}</Button>
                      </EmptyContent>
                    </Empty>
                  ) : searchFilteredTasks.length === 0 && taskSearch.trim() ? (
                    <ListSearchEmptyState
                      labels={{
                        title: t.tasks.emptySearchTitle,
                        body: t.tasks.emptySearchBody,
                        clear: t.tasks.searchClear,
                      }}
                      onClear={() => setTaskSearch("")}
                    />
                  ) : (
                    <TasksView
                      viewMode={viewMode}
                      spaceId={activeSpaceId!}
                      tasks={searchFilteredTasks}
                      allTasks={store.tasks}
                      highlightTaskId={highlightTaskId}
                      onTasksReplace={handleTasksReplace}
                      columnTitles={columnTitles}
                      cardLabels={cardLabels}
                      listLabels={listLabels}
                      statusLabel={statusLabel}
                      localeTag={getIntlLocaleTag(locale)}
                      onEdit={openEditTask}
                      onDelete={(task) => setTaskPendingDelete(task)}
                      onArchive={handleArchive}
                      onUnarchive={handleUnarchive}
                    />
                  )}
                </div>
              </div>
          )}
        </div>
      </div>

      <ManageSpacesSheet
        open={manageSheetOpen}
        onOpenChange={setManageSheetOpen}
        spaces={spacesSorted}
        onAddSpace={openAddSpaceFromManage}
        onRenameSpace={openRenameSpaceFromManage}
        onDeleteSpace={(space) => {
          requestDeleteSpace(space);
          setManageSheetOpen(false);
        }}
      />

      <DeleteSpaceWithTasksDialog
        key={spaceDeleteWithTasks?.id ?? "closed"}
        open={spaceDeleteWithTasks != null}
        space={spaceDeleteWithTasks}
        otherSpaces={store.spaces}
        taskCount={
          spaceDeleteWithTasks
            ? store.tasks.filter((x) => x.space_id === spaceDeleteWithTasks.id).length
            : 0
        }
        onOpenChange={(open) => {
          if (!open) setSpaceDeleteWithTasks(null);
        }}
        onMoveAndDelete={confirmDeleteSpaceMoveTasks}
        onDeleteAllTasks={confirmDeleteSpaceAndAllTasks}
      />

      <AddSpaceSheet
        open={spaceSheetOpen}
        editingSpace={editingSpace}
        initialNameWhenCreate={editingSpace ? undefined : spaceSheetInitialName}
        onClose={closeSpaceSheet}
        onSubmit={handleSpaceSubmit}
      />

      <AddTaskSheet
        open={taskSheetOpen}
        editingItem={editingTaskLive}
        onClose={() => {
          setTaskSheetOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTaskFromForm}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={(taskId, commentId) => setCommentPendingDelete({ taskId, commentId })}
      />
    </div>
  );
}

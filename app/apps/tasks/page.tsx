import type { Metadata } from "next";
import { Suspense } from "react";
import { TasksAppPage } from "@/components/apps/tasks/tasks-app-page";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata("tasks", "/apps/tasks");

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksAppPage />
    </Suspense>
  );
}

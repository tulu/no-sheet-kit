import { toast } from "sonner";
import {
  trackAppRecordCreated,
  trackAppRecordDeleted,
  trackAppRecordUpdated,
} from "@/lib/analytics/events";
import type { Messages } from "@/lib/i18n/messages";

export type AppToastApp =
  | "links"
  | "domains"
  | "dates"
  | "loans"
  | "tasks"
  | "collections"
  | "tracker"
  | "events";

export type AppCrudAction = "created" | "updated" | "deleted";

export function appCrudToast(t: Messages, app: AppToastApp, action: AppCrudAction): void {
  const row = t.common.appToasts[app][action];
  toast.success(row.title);
  if (action === "created") {
    trackAppRecordCreated(app);
  } else if (action === "updated") {
    trackAppRecordUpdated(app);
  } else {
    trackAppRecordDeleted(app);
  }
}

export function appLoanPaymentRecordedToast(t: Messages): void {
  toast.success(t.common.appToasts.loans.paymentRecorded.title);
  trackAppRecordCreated("loans");
}

export function appLoanPaymentsUpdatedToast(t: Messages): void {
  toast.success(t.common.appToasts.loans.paymentsUpdated.title);
  trackAppRecordUpdated("loans");
}

export function appTasksSpaceToast(t: Messages, action: "created" | "updated" | "deleted"): void {
  const row =
    action === "created"
      ? t.common.appToasts.tasks.spaceCreated
      : action === "updated"
        ? t.common.appToasts.tasks.spaceUpdated
        : t.common.appToasts.tasks.spaceDeleted;
  toast.success(row.title);
  if (action === "created") {
    trackAppRecordCreated("tasks");
  } else if (action === "updated") {
    trackAppRecordUpdated("tasks");
  } else {
    trackAppRecordDeleted("tasks");
  }
}

export function appTasksCommentToast(t: Messages, action: "created" | "updated" | "deleted"): void {
  const row =
    action === "created"
      ? t.common.appToasts.tasks.commentAdded
      : action === "updated"
        ? t.common.appToasts.tasks.commentUpdated
        : t.common.appToasts.tasks.commentDeleted;
  toast.success(row.title);
}

export function appTrackerTrackToast(
  t: Messages,
  action: "created" | "updated" | "deleted"
): void {
  const row =
    action === "created"
      ? t.common.appToasts.tracker.trackCreated
      : action === "updated"
        ? t.common.appToasts.tracker.trackUpdated
        : t.common.appToasts.tracker.trackDeleted;
  toast.success(row.title);
  if (action === "created") {
    trackAppRecordCreated("tracker");
  } else if (action === "updated") {
    trackAppRecordUpdated("tracker");
  } else {
    trackAppRecordDeleted("tracker");
  }
}

export function appEventsEventToast(
  t: Messages,
  action: "created" | "updated" | "deleted"
): void {
  const row =
    action === "created"
      ? t.common.appToasts.events.eventCreated
      : action === "updated"
        ? t.common.appToasts.events.eventUpdated
        : t.common.appToasts.events.eventDeleted;
  toast.success(row.title);
  if (action === "created") {
    trackAppRecordCreated("events");
  } else if (action === "updated") {
    trackAppRecordUpdated("events");
  } else {
    trackAppRecordDeleted("events");
  }
}

export function appEventsTaskToast(
  t: Messages,
  action: "created" | "updated" | "deleted"
): void {
  const row =
    action === "created"
      ? t.common.appToasts.events.taskCreated
      : action === "updated"
        ? t.common.appToasts.events.taskUpdated
        : t.common.appToasts.events.taskDeleted;
  toast.success(row.title);
  if (action === "created") {
    trackAppRecordCreated("events");
  } else if (action === "updated") {
    trackAppRecordUpdated("events");
  } else {
    trackAppRecordDeleted("events");
  }
}

export function appEventsTaskCommentToast(
  t: Messages,
  action: "created" | "updated" | "deleted"
): void {
  const row =
    action === "created"
      ? t.common.appToasts.events.taskCommentAdded
      : action === "updated"
        ? t.common.appToasts.events.taskCommentUpdated
        : t.common.appToasts.events.taskCommentDeleted;
  toast.success(row.title);
}

export function appCollectionsCollectionToast(
  t: Messages,
  action: "created" | "updated" | "deleted"
): void {
  const row =
    action === "created"
      ? t.common.appToasts.collections.collectionCreated
      : action === "updated"
        ? t.common.appToasts.collections.collectionUpdated
        : t.common.appToasts.collections.collectionDeleted;
  toast.success(row.title);
  if (action === "created") {
    trackAppRecordCreated("collections");
  } else if (action === "updated") {
    trackAppRecordUpdated("collections");
  } else {
    trackAppRecordDeleted("collections");
  }
}

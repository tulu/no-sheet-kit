import { toast } from "sonner";
import {
  trackAppRecordCreated,
  trackAppRecordDeleted,
  trackAppRecordUpdated,
} from "@/lib/analytics/events";
import type { Messages } from "@/lib/i18n/messages";

export type AppToastApp = "links" | "domains" | "dates" | "loans" | "tasks" | "collections";

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

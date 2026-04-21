import { toast } from "sonner";
import type { Messages } from "@/lib/i18n/messages";

export type AppToastApp = "links" | "domains" | "dates" | "loans" | "tasks";

export type AppCrudAction = "created" | "updated" | "deleted";

export function appCrudToast(t: Messages, app: AppToastApp, action: AppCrudAction): void {
  const row = t.common.appToasts[app][action];
  toast.success(row.title);
}

export function appLoanPaymentRecordedToast(t: Messages): void {
  toast.success(t.common.appToasts.loans.paymentRecorded.title);
}

export function appLoanPaymentsUpdatedToast(t: Messages): void {
  toast.success(t.common.appToasts.loans.paymentsUpdated.title);
}

export function appTasksSpaceToast(t: Messages, action: "created" | "updated" | "deleted"): void {
  const row =
    action === "created"
      ? t.common.appToasts.tasks.spaceCreated
      : action === "updated"
        ? t.common.appToasts.tasks.spaceUpdated
        : t.common.appToasts.tasks.spaceDeleted;
  toast.success(row.title);
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

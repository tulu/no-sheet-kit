import { toast } from "sonner";
import type { Messages } from "@/lib/i18n/messages";

export type AppToastApp = "links" | "domains" | "dates" | "loans";

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

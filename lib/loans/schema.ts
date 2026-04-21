export const NSKLOANS_STORAGE_KEY = "nskloans";
export const NSKLOANS_SCHEMA_VERSION = 1;

export type LoanDirection = "lent" | "borrowed";

export type LoanFilterId = "all" | "lent" | "borrowed" | "active" | "settled";

export type LoansViewMode = "grid" | "list";

export const LOANS_VIEW_MODES: readonly LoansViewMode[] = ["grid", "list"];

export type LoanPayment = {
  id: string;
  amount: string;
  date: string;
};

export type NSKLoanItem = {
  id: string;
  direction: LoanDirection;
  counterparty_name: string;
  currency: string;
  amount: string;
  date: string;
  notes?: string;
  payments: LoanPayment[];
  created_at: string;
  updated_at: string;
};

export type NSKLoansSchema = {
  version: number;
  /** ISO timestamp of last successful Google Drive sync for this app payload, if any. */
  last_google_sync_at: string | null;
  items: NSKLoanItem[];
};

export function createEmptyNSKLoansSchema(): NSKLoansSchema {
  return {
    version: NSKLOANS_SCHEMA_VERSION,
    last_google_sync_at: null,
    items: [],
  };
}

export function isLoanDirection(value: string): value is LoanDirection {
  return value === "lent" || value === "borrowed";
}

export { NSKEVENTS_STORAGE_KEY } from "@/lib/storage/anonymous-storage-keys";
export const NSKEVENTS_SCHEMA_VERSION = 1;

export {
  TASKS_VIEW_MODES as EVENTS_TASKS_VIEW_MODES,
  type TasksViewMode as EventsTasksViewMode,
} from "@/lib/tasks/schema";

export const EVENTS_GUESTS_VIEW_MODES = ["cards", "table"] as const;
export type EventsGuestsViewMode = (typeof EVENTS_GUESTS_VIEW_MODES)[number];

export const EVENTS_EXPENSES_VIEW_MODES = ["grid", "list"] as const;
export type EventsExpensesViewMode = (typeof EVENTS_EXPENSES_VIEW_MODES)[number];

export const EVENTS_DETAIL_TABS = ["info", "guests", "tasks", "expenses"] as const;
export type EventsDetailTab = (typeof EVENTS_DETAIL_TABS)[number];

export const EVENT_GUEST_RSVP_STATUSES = ["pending", "confirmed", "declined"] as const;
export type EventGuestRsvpStatus = (typeof EVENT_GUEST_RSVP_STATUSES)[number];

export type NSKEvent = {
  id: string;
  name: string;
  /** Linked embedded space in NSK Tasks storage. */
  tasks_space_id: string;
  /** YYYY-MM-DD */
  start_date?: string;
  /** HH:MM */
  start_time?: string;
  location?: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type NSKEventFamily = {
  id: string;
  event_id: string;
  name: string;
  invitation_sent: boolean;
  rsvp_status: EventGuestRsvpStatus;
  order: number;
  created_at: string;
  updated_at: string;
};

export type NSKEventGuest = {
  id: string;
  event_id: string;
  family_id?: string;
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dietary_restrictions?: string;
  is_kid: boolean;
  invitation_sent: boolean;
  rsvp_status: EventGuestRsvpStatus;
  order: number;
  created_at: string;
  updated_at: string;
};

export type NSKEventPayment = {
  id: string;
  amount: string;
  /** YYYY-MM-DD */
  date: string;
  note?: string;
};

export type NSKEventExpense = {
  id: string;
  event_id: string;
  name: string;
  total_amount: string;
  /** ISO-like code, e.g. USD, EUR */
  currency: string;
  payments: NSKEventPayment[];
  order: number;
  created_at: string;
  updated_at: string;
};

export type NSKEventsSchema = {
  version: number;
  last_google_sync_at: string | null;
  events: NSKEvent[];
  families: NSKEventFamily[];
  guests: NSKEventGuest[];
  expenses: NSKEventExpense[];
};

export function isEventGuestRsvpStatus(value: string): value is EventGuestRsvpStatus {
  return (EVENT_GUEST_RSVP_STATUSES as readonly string[]).includes(value);
}

export function createEmptyNSKEventsSchema(): NSKEventsSchema {
  return {
    version: NSKEVENTS_SCHEMA_VERSION,
    last_google_sync_at: null,
    events: [],
    families: [],
    guests: [],
    expenses: [],
  };
}

import * as XLSX from "xlsx";
import type { Locale } from "@/lib/i18n/types";
import {
  buildFamilyGuestSections,
  countFamilyMembersByKid,
  familyNameById,
  familyRsvpBreakdownByKid,
  formatEventSidebarSubtitle,
  formatFamilyRsvpBreakdown,
  guestDisplayName,
} from "@/lib/events/events-helpers";
import type { EventGuestRsvpStatus, NSKEvent, NSKEventFamily, NSKEventGuest } from "@/lib/events/schema";

export type EventGuestExportLabels = {
  exportTitle: string;
  invitationYes: string;
  invitationNo: string;
  adultType: string;
  kidType: string;
  noFamily: string;
  table: {
    index: string;
    name: string;
    family: string;
    phone: string;
    email: string;
    dietary: string;
    rsvp: string;
    invitation: string;
    adults: string;
    kids: string;
    members: string;
    rsvpAdults: string;
    rsvpKids: string;
    guestType: string;
  };
  rsvp: Record<EventGuestRsvpStatus, string>;
};

function padRow(row: string[], width: number): string[] {
  const next = [...row];
  while (next.length < width) next.push("");
  return next;
}

function slugifyEventName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "event"
  );
}

function buildFlatHeaders(labels: EventGuestExportLabels): string[] {
  return [
    labels.table.index,
    labels.table.name,
    labels.table.family,
    labels.table.phone,
    labels.table.email,
    labels.table.dietary,
    labels.table.rsvp,
    labels.table.invitation,
    labels.table.guestType,
  ];
}

function buildFlatGuestRow(
  guest: NSKEventGuest,
  index: number,
  families: NSKEventFamily[],
  labels: EventGuestExportLabels
): string[] {
  return [
    String(index),
    guestDisplayName(guest),
    familyNameById(families, guest.family_id) ?? labels.noFamily,
    guest.phone ?? "",
    guest.email ?? "",
    guest.dietary_restrictions ?? "",
    labels.rsvp[guest.rsvp_status],
    guest.invitation_sent ? labels.invitationYes : labels.invitationNo,
    guest.is_kid ? labels.kidType : labels.adultType,
  ];
}

export function exportEventGuestsToExcel(options: {
  locale: Locale;
  event: NSKEvent;
  groupByFamily: boolean;
  families: NSKEventFamily[];
  filteredGuests: NSKEventGuest[];
  search: string;
  labels: EventGuestExportLabels;
}): void {
  const { locale, event, groupByFamily, families, filteredGuests, search, labels } = options;

  const subtitle = formatEventSidebarSubtitle(event, locale);
  const eventLine = subtitle ? `${event.name} · ${subtitle}` : event.name;

  const headerBlock: string[][] = [[labels.exportTitle], [eventLine], []];

  let dataRows: string[][];

  if (groupByFamily) {
    const sections = buildFamilyGuestSections(families, filteredGuests, search);
    const familyHeaders = [
      labels.table.name,
      labels.table.adults,
      labels.table.kids,
      labels.table.members,
      labels.table.invitation,
      labels.table.rsvpAdults,
      labels.table.rsvpKids,
    ];
    dataRows = [familyHeaders];

    for (const { family, members } of sections) {
      const { adults, kids } = countFamilyMembersByKid(members);
      const breakdown = familyRsvpBreakdownByKid(members);
      dataRows.push([
        family.name,
        String(adults),
        String(kids),
        members.map(guestDisplayName).join("; "),
        family.invitation_sent ? labels.invitationYes : labels.invitationNo,
        formatFamilyRsvpBreakdown(breakdown.adults, labels.rsvp),
        formatFamilyRsvpBreakdown(breakdown.kids, labels.rsvp),
      ]);
    }

    const unassigned = filteredGuests.filter((guest) => !guest.family_id);
    if (unassigned.length > 0) {
      dataRows.push([]);
      dataRows.push(buildFlatHeaders(labels));
      unassigned.forEach((guest, index) => {
        dataRows.push(buildFlatGuestRow(guest, index + 1, families, labels));
      });
    }
  } else {
    dataRows = [buildFlatHeaders(labels)];
    filteredGuests.forEach((guest, index) => {
      dataRows.push(buildFlatGuestRow(guest, index + 1, families, labels));
    });
  }

  const allRows = [...headerBlock, ...dataRows];
  const colCount = Math.max(...allRows.map((row) => row.length), 1);
  const paddedRows = allRows.map((row) => padRow(row, colCount));

  const worksheet = XLSX.utils.aoa_to_sheet(paddedRows);
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");

  const date = new Date().toISOString().slice(0, 10);
  const filename = `guests-${slugifyEventName(event.name)}-${date}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

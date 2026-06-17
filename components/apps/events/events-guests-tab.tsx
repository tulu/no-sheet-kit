"use client";

import { useState } from "react";
import {
  Check,
  Download,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Undo2,
  UserPlus,
  Users,
} from "lucide-react";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
import { CardActionsMenu, type CardActionsMenuItem } from "@/components/common/card-actions-menu";
import { ListSearchEmptyState } from "@/components/common/list-search-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useI18n } from "@/components/providers/i18n-provider";
import { persistAppViewBundle } from "@/lib/apps/view-persistence";
import {
  EMPTY_EVENT_GUEST_FILTERS,
  buildFamilyGuestSections,
  countFamilyMembersByKid,
  familyNameById,
  familyRsvpBreakdownByKid,
  filterEventGuests,
  formatFamilyRsvpBreakdown,
  guestDisplayName,
  hasActiveGuestFilters,
  type EventGuestListFilters,
} from "@/lib/events/events-helpers";
import { exportEventGuestsToExcel } from "@/lib/events/events-guest-export";
import type {
  EventGuestRsvpStatus,
  EventsGuestsViewMode,
  NSKEvent,
  NSKEventFamily,
  NSKEventGuest,
} from "@/lib/events/schema";
import { EventsGuestsFilters } from "./events-guests-filters";
import { GuestRsvpBadge, buildRsvpMenuActions } from "./events-guest-rsvp-ui";

function familyCardMenuActions(
  family: NSKEventFamily,
  labels: {
    markRsvpPending: string;
    markRsvpConfirmed: string;
    markRsvpDeclined: string;
    markInvitationSent: string;
    markInvitationNotSent: string;
    edit: string;
    delete: string;
  },
  onEdit: () => void,
  onDelete: () => void,
  onInvitationChange: (sent: boolean) => void,
  onRsvpChange: (status: EventGuestRsvpStatus) => void
): CardActionsMenuItem[] {
  return [
    ...buildRsvpMenuActions(
      family.rsvp_status,
      {
        pending: labels.markRsvpPending,
        confirmed: labels.markRsvpConfirmed,
        declined: labels.markRsvpDeclined,
      },
      onRsvpChange
    ),
    family.invitation_sent
      ? {
          label: labels.markInvitationNotSent,
          icon: Undo2,
          onSelect: () => onInvitationChange(false),
        }
      : {
          label: labels.markInvitationSent,
          icon: Check,
          onSelect: () => onInvitationChange(true),
        },
    { label: labels.edit, icon: Pencil, onSelect: onEdit },
    { label: labels.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
}

function guestCardMenuActions(
  guest: NSKEventGuest,
  labels: {
    markRsvpPending: string;
    markRsvpConfirmed: string;
    markRsvpDeclined: string;
    markInvitationSent: string;
    markInvitationNotSent: string;
    edit: string;
    delete: string;
  },
  onEdit: () => void,
  onDelete: () => void,
  onInvitationChange: (sent: boolean) => void,
  onRsvpChange: (status: EventGuestRsvpStatus) => void
): CardActionsMenuItem[] {
  return [
    ...buildRsvpMenuActions(
      guest.rsvp_status,
      {
        pending: labels.markRsvpPending,
        confirmed: labels.markRsvpConfirmed,
        declined: labels.markRsvpDeclined,
      },
      onRsvpChange
    ),
    guest.invitation_sent
      ? {
          label: labels.markInvitationNotSent,
          icon: Undo2,
          onSelect: () => onInvitationChange(false),
        }
      : {
          label: labels.markInvitationSent,
          icon: Check,
          onSelect: () => onInvitationChange(true),
        },
    { label: labels.edit, icon: Pencil, onSelect: onEdit },
    { label: labels.delete, icon: Trash2, onSelect: onDelete, destructive: true },
  ];
}

type EventsGuestsTabProps = {
  event: NSKEvent;
  families: NSKEventFamily[];
  guests: NSKEventGuest[];
  guestsViewMode: EventsGuestsViewMode;
  onGuestsViewModeChange: (mode: EventsGuestsViewMode) => void;
  groupByFamily: boolean;
  onGroupByFamilyChange: (value: boolean) => void;
  onAddFamily: () => void;
  onEditFamily: (family: NSKEventFamily) => void;
  onDeleteFamily: (family: NSKEventFamily) => void;
  onFamilyInvitationChange: (familyId: string, sent: boolean) => void;
  onFamilyRsvpChange: (familyId: string, status: EventGuestRsvpStatus) => void;
  onAddGuest: () => void;
  onEditGuest: (guest: NSKEventGuest) => void;
  onDeleteGuest: (guest: NSKEventGuest) => void;
  onGuestInvitationChange: (guestId: string, sent: boolean) => void;
  onGuestRsvpChange: (guestId: string, status: EventGuestRsvpStatus) => void;
};

export function EventsGuestsTab({
  event,
  families,
  guests,
  guestsViewMode,
  onGuestsViewModeChange,
  groupByFamily,
  onGroupByFamilyChange,
  onAddFamily,
  onEditFamily,
  onDeleteFamily,
  onFamilyInvitationChange,
  onFamilyRsvpChange,
  onAddGuest,
  onEditGuest,
  onDeleteGuest,
  onGuestInvitationChange,
  onGuestRsvpChange,
}: EventsGuestsTabProps) {
  const { locale, t } = useI18n();
  const [search, setSearch] = useState("");
  const [guestFilters, setGuestFilters] = useState<EventGuestListFilters>(EMPTY_EVENT_GUEST_FILTERS);

  const filteredGuests = filterEventGuests(guests, families, search, guestFilters);

  function handleViewChange(mode: EventsGuestsViewMode) {
    onGuestsViewModeChange(mode);
    persistAppViewBundle("events", mode);
  }

  function handleExportExcel() {
    exportEventGuestsToExcel({
      locale,
      event,
      groupByFamily,
      families,
      filteredGuests,
      search,
      labels: {
        exportTitle: t.events.guests.exportTitle,
        invitationYes: t.events.guests.invitationYes,
        invitationNo: t.events.guests.invitationNo,
        adultType: t.events.guests.filters.adult,
        kidType: t.events.fields.isKid,
        noFamily: t.events.noFamilyGroup,
        table: t.events.guests.table,
        rsvp: t.events.rsvp,
      },
    });
  }

  const hasSearch = search.trim().length > 0;
  const hasFilters = hasActiveGuestFilters(guestFilters);

  return (
    <div>
      <AppListToolbar<EventsGuestsViewMode>
        totalLabel={t.events.guests.totalLabel.replace("{count}", String(filteredGuests.length))}
        viewModes={[
          { id: "cards", icon: LayoutGrid, ariaLabel: t.events.viewCards },
          { id: "table", icon: List, ariaLabel: t.events.viewTable },
        ]}
        viewMode={guestsViewMode}
        onViewModeChange={handleViewChange}
        addButtonLabel={t.events.guests.addGuest}
        onAdd={onAddGuest}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: t.events.guests.searchPlaceholder,
          "aria-label": t.events.guests.searchAriaLabel,
        }}
        searchTrailing={
          <>
            <EventsGuestsFilters filters={guestFilters} onChange={setGuestFilters} />
            <Switch
              id="events-group-by-family"
              checked={groupByFamily}
              onCheckedChange={onGroupByFamilyChange}
            />
            <Label
              htmlFor="events-group-by-family"
              className="whitespace-nowrap text-sm text-muted-foreground"
            >
              {t.events.groupByFamily}
            </Label>
          </>
        }
        addButtonLeading={
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleExportExcel}
            aria-label={t.events.guests.exportExcelAria}
          >
            <Download className="size-4" />
          </Button>
        }
        extraActions={
          <Button type="button" variant="outline" onClick={onAddFamily}>
            {t.events.guests.addFamily}
          </Button>
        }
      />

      {guests.length === 0 ? (
        <Empty className="border border-border p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle className="text-xl font-semibold text-foreground">
              {t.events.guests.emptyTitle}
            </EmptyTitle>
            <EmptyDescription>{t.events.guests.emptyBody}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={onAddGuest}>
              <UserPlus className="mr-1 size-4" />
              {t.events.guests.addGuest}
            </Button>
            <Button type="button" variant="outline" onClick={onAddFamily}>
              {t.events.guests.addFamily}
            </Button>
          </EmptyContent>
        </Empty>
      ) : filteredGuests.length === 0 && hasSearch ? (
        <ListSearchEmptyState
          labels={{
            title: t.events.guests.searchEmptyTitle,
            body: t.events.guests.searchEmptyBody,
            clear: t.events.guests.searchClear,
          }}
          onClear={() => setSearch("")}
        />
      ) : filteredGuests.length === 0 && hasFilters ? (
        <ListSearchEmptyState
          labels={{
            title: t.events.guests.filters.emptyTitle,
            body: t.events.guests.filters.emptyBody,
            clear: t.events.guests.filters.emptyClear,
          }}
          onClear={() => setGuestFilters(EMPTY_EVENT_GUEST_FILTERS)}
        />
      ) : groupByFamily ? (
        <GroupedGuestsView
          families={families}
          guests={filteredGuests}
          search={search}
          viewMode={guestsViewMode}
          onEditFamily={onEditFamily}
          onDeleteFamily={onDeleteFamily}
          onFamilyInvitationChange={onFamilyInvitationChange}
          onFamilyRsvpChange={onFamilyRsvpChange}
          onEditGuest={onEditGuest}
          onDeleteGuest={onDeleteGuest}
          onGuestInvitationChange={onGuestInvitationChange}
          onGuestRsvpChange={onGuestRsvpChange}
        />
      ) : guestsViewMode === "cards" ? (
        <GuestCardsGrid
          guests={filteredGuests}
          families={families}
          onEditGuest={onEditGuest}
          onDeleteGuest={onDeleteGuest}
          onGuestInvitationChange={onGuestInvitationChange}
          onGuestRsvpChange={onGuestRsvpChange}
        />
      ) : (
        <GuestTable
          guests={filteredGuests}
          families={families}
          onEditGuest={onEditGuest}
          onDeleteGuest={onDeleteGuest}
          onGuestInvitationChange={onGuestInvitationChange}
          onGuestRsvpChange={onGuestRsvpChange}
        />
      )}
    </div>
  );
}

function GuestCard({
  guest,
  familyLabel,
  onEdit,
  onDelete,
  onInvitationChange,
  onRsvpChange,
}: {
  guest: NSKEventGuest;
  familyLabel?: string;
  onEdit: (g: NSKEventGuest) => void;
  onDelete: (g: NSKEventGuest) => void;
  onInvitationChange: (id: string, sent: boolean) => void;
  onRsvpChange: (id: string, status: EventGuestRsvpStatus) => void;
}) {
  const { t } = useI18n();
  return (
    <Card className="h-full border border-border/70 gap-0 py-0 pb-4">
      <CardHeader className="gap-2 rounded-none px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
              <CardTitle className="line-clamp-2 min-w-0 max-w-full text-base font-semibold leading-snug">
                {guestDisplayName(guest)}
              </CardTitle>
              {guest.is_kid ? (
                <Badge variant="outline" className="shrink-0 font-medium">
                  {t.events.fields.isKid}
                </Badge>
              ) : null}
              <GuestRsvpBadge status={guest.rsvp_status} label={t.events.rsvp[guest.rsvp_status]} />
              {guest.invitation_sent ? (
                <Badge
                  variant="outline"
                  className="shrink-0 border-emerald-500/40 font-medium text-emerald-700 dark:text-emerald-400"
                >
                  {t.events.invitationSent}
                </Badge>
              ) : null}
            </div>
            {familyLabel ? (
              <p className="truncate text-xs text-muted-foreground" title={familyLabel}>
                {familyLabel}
              </p>
            ) : null}
          </div>
          <div className="shrink-0">
            <CardActionsMenu
              ariaLabel={t.events.cardActionsMenu}
              actions={guestCardMenuActions(
                guest,
                {
                  markRsvpPending: t.events.guests.markRsvpPending,
                  markRsvpConfirmed: t.events.guests.markRsvpConfirmed,
                  markRsvpDeclined: t.events.guests.markRsvpDeclined,
                  markInvitationSent: t.events.guests.markInvitationSent,
                  markInvitationNotSent: t.events.guests.markInvitationNotSent,
                  edit: t.events.guests.editGuest,
                  delete: t.events.guests.deleteGuest,
                },
                () => onEdit(guest),
                () => onDelete(guest),
                (sent) => onInvitationChange(guest.id, sent),
                (status) => onRsvpChange(guest.id, status)
              )}
            />
          </div>
        </div>
      </CardHeader>
      {guest.phone || guest.email || guest.dietary_restrictions ? (
        <CardContent className="space-y-2 px-4 pb-0 pt-3">
          {guest.phone ? (
            <p className="truncate text-sm text-muted-foreground">{guest.phone}</p>
          ) : null}
          {guest.email ? (
            <p className="truncate text-sm text-muted-foreground">{guest.email}</p>
          ) : null}
          {guest.dietary_restrictions ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{guest.dietary_restrictions}</p>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

function GuestCardsGrid({
  guests,
  families,
  onEditGuest,
  onDeleteGuest,
  onGuestInvitationChange,
  onGuestRsvpChange,
}: {
  guests: NSKEventGuest[];
  families: NSKEventFamily[];
  onEditGuest: (g: NSKEventGuest) => void;
  onDeleteGuest: (g: NSKEventGuest) => void;
  onGuestInvitationChange: (id: string, sent: boolean) => void;
  onGuestRsvpChange: (id: string, status: EventGuestRsvpStatus) => void;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {guests.map((guest) => (
        <li key={guest.id}>
          <GuestCard
            guest={guest}
            familyLabel={familyNameById(families, guest.family_id) ?? undefined}
            onEdit={onEditGuest}
            onDelete={onDeleteGuest}
            onInvitationChange={onGuestInvitationChange}
            onRsvpChange={onGuestRsvpChange}
          />
        </li>
      ))}
    </ul>
  );
}

function GuestTable({
  guests,
  families,
  showRowNumber = true,
  onEditGuest,
  onDeleteGuest,
  onGuestInvitationChange,
  onGuestRsvpChange,
}: {
  guests: NSKEventGuest[];
  families: NSKEventFamily[];
  showRowNumber?: boolean;
  onEditGuest: (g: NSKEventGuest) => void;
  onDeleteGuest: (g: NSKEventGuest) => void;
  onGuestInvitationChange: (id: string, sent: boolean) => void;
  onGuestRsvpChange: (id: string, status: EventGuestRsvpStatus) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            {showRowNumber ? (
              <TableHead className="w-12 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.events.guests.table.index}
              </TableHead>
            ) : null}
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.name}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.family}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.phone}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.email}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.dietary}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.rsvp}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.invitation}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{t.events.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest, index) => (
            <TableRow key={guest.id} className="hover:bg-muted/20">
              {showRowNumber ? (
                <TableCell className="px-3 py-2 text-sm tabular-nums text-muted-foreground">
                  {index + 1}
                </TableCell>
              ) : null}
              <TableCell className="px-3 py-2 font-medium text-foreground">
                {guestDisplayName(guest)}
                {guest.is_kid ? (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({t.events.fields.isKid})
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-muted-foreground">
                {familyNameById(families, guest.family_id) ?? t.events.noFamilyGroup}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-muted-foreground">
                {guest.phone ?? "—"}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-muted-foreground">
                {guest.email ?? "—"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate px-3 py-2 text-sm text-muted-foreground">
                {guest.dietary_restrictions ?? "—"}
              </TableCell>
              <TableCell className="px-3 py-2">
                <GuestRsvpBadge status={guest.rsvp_status} label={t.events.rsvp[guest.rsvp_status]} />
              </TableCell>
              <TableCell className="px-3 py-2">
                <Switch
                  checked={guest.invitation_sent}
                  onCheckedChange={(v) => onGuestInvitationChange(guest.id, v)}
                  aria-label={t.events.invitationSent}
                />
              </TableCell>
              <TableCell className="px-2 py-1 align-middle">
                <CardActionsMenu
                  ariaLabel={t.events.cardActionsMenu}
                  actions={guestCardMenuActions(
                    guest,
                    {
                      markRsvpPending: t.events.guests.markRsvpPending,
                      markRsvpConfirmed: t.events.guests.markRsvpConfirmed,
                      markRsvpDeclined: t.events.guests.markRsvpDeclined,
                      markInvitationSent: t.events.guests.markInvitationSent,
                      markInvitationNotSent: t.events.guests.markInvitationNotSent,
                      edit: t.events.guests.editGuest,
                      delete: t.events.guests.deleteGuest,
                    },
                    () => onEditGuest(guest),
                    () => onDeleteGuest(guest),
                    (sent) => onGuestInvitationChange(guest.id, sent),
                    (status) => onGuestRsvpChange(guest.id, status)
                  )}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function familyMenuLabels(t: ReturnType<typeof useI18n>["t"]) {
  return {
    markRsvpPending: t.events.guests.markRsvpPending,
    markRsvpConfirmed: t.events.guests.markRsvpConfirmed,
    markRsvpDeclined: t.events.guests.markRsvpDeclined,
    markInvitationSent: t.events.guests.markInvitationSent,
    markInvitationNotSent: t.events.guests.markInvitationNotSent,
    edit: t.events.guests.editFamily,
    delete: t.events.guests.deleteFamily,
  };
}

function FamilyGuestCard({
  family,
  members,
  onEditFamily,
  onDeleteFamily,
  onFamilyInvitationChange,
  onFamilyRsvpChange,
}: {
  family: NSKEventFamily;
  members: NSKEventGuest[];
  onEditFamily: (family: NSKEventFamily) => void;
  onDeleteFamily: (family: NSKEventFamily) => void;
  onFamilyInvitationChange: (familyId: string, sent: boolean) => void;
  onFamilyRsvpChange: (familyId: string, status: EventGuestRsvpStatus) => void;
}) {
  const { t } = useI18n();
  const labels = familyMenuLabels(t);

  return (
    <Card className="h-full border border-border/70 gap-0 py-0 pb-4">
      <CardHeader className="gap-3 rounded-none px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <CardTitle className="line-clamp-2 min-w-0 text-xl font-semibold leading-snug">
                {family.name}
              </CardTitle>
              <GuestRsvpBadge status={family.rsvp_status} label={t.events.rsvp[family.rsvp_status]} />
              {family.invitation_sent ? (
                <Badge
                  variant="outline"
                  className="shrink-0 border-emerald-500/40 font-medium text-emerald-700 dark:text-emerald-400"
                >
                  {t.events.invitationSent}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="shrink-0">
            <CardActionsMenu
              ariaLabel={t.events.cardActionsMenu}
              actions={familyCardMenuActions(
                family,
                labels,
                () => onEditFamily(family),
                () => onDeleteFamily(family),
                (sent) => onFamilyInvitationChange(family.id, sent),
                (status) => onFamilyRsvpChange(family.id, status)
              )}
            />
          </div>
        </div>
      </CardHeader>
      {members.length > 0 ? (
        <CardContent className="space-y-2 px-4 pb-0 pt-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t.events.guests.table.members}
          </p>
          <ul className="space-y-1.5">
            {members.map((member) => (
              <li key={member.id} className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-medium text-foreground">{guestDisplayName(member)}</span>
                {member.is_kid ? (
                  <Badge variant="outline" className="shrink-0 font-medium">
                    {t.events.fields.isKid}
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      ) : null}
    </Card>
  );
}

function FamilyGuestsTable({
  sections,
  onEditFamily,
  onDeleteFamily,
  onFamilyInvitationChange,
  onFamilyRsvpChange,
}: {
  sections: { family: NSKEventFamily; members: NSKEventGuest[] }[];
  onEditFamily: (family: NSKEventFamily) => void;
  onDeleteFamily: (family: NSKEventFamily) => void;
  onFamilyInvitationChange: (familyId: string, sent: boolean) => void;
  onFamilyRsvpChange: (familyId: string, status: EventGuestRsvpStatus) => void;
}) {
  const { t } = useI18n();
  const labels = familyMenuLabels(t);
  const rsvpLabels = t.events.rsvp;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.name}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.adults}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.kids}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.invitation}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.rsvpAdults}
            </TableHead>
            <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.events.guests.table.rsvpKids}
            </TableHead>
            <TableHead className="w-10 px-2 py-2">
              <span className="sr-only">{t.events.cardActionsMenu}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map(({ family, members }) => {
            const { adults, kids } = countFamilyMembersByKid(members);
            const breakdown = familyRsvpBreakdownByKid(members);
            return (
              <TableRow key={family.id} className="hover:bg-muted/20">
                <TableCell className="px-3 py-2 font-medium text-foreground">{family.name}</TableCell>
                <TableCell className="px-3 py-2 text-sm tabular-nums text-muted-foreground">
                  {adults}
                </TableCell>
                <TableCell className="px-3 py-2 text-sm tabular-nums text-muted-foreground">
                  {kids}
                </TableCell>
                <TableCell className="px-3 py-2 text-sm text-muted-foreground">
                  {family.invitation_sent ? t.events.guests.invitationYes : t.events.guests.invitationNo}
                </TableCell>
                <TableCell className="px-3 py-2 text-sm text-muted-foreground">
                  {formatFamilyRsvpBreakdown(breakdown.adults, rsvpLabels)}
                </TableCell>
                <TableCell className="px-3 py-2 text-sm text-muted-foreground">
                  {formatFamilyRsvpBreakdown(breakdown.kids, rsvpLabels)}
                </TableCell>
                <TableCell className="px-2 py-1 align-middle">
                  <CardActionsMenu
                    ariaLabel={t.events.cardActionsMenu}
                    actions={familyCardMenuActions(
                      family,
                      labels,
                      () => onEditFamily(family),
                      () => onDeleteFamily(family),
                      (sent) => onFamilyInvitationChange(family.id, sent),
                      (status) => onFamilyRsvpChange(family.id, status)
                    )}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function GroupedGuestsView({
  families,
  guests,
  search,
  viewMode,
  onEditFamily,
  onDeleteFamily,
  onFamilyInvitationChange,
  onFamilyRsvpChange,
  onEditGuest,
  onDeleteGuest,
  onGuestInvitationChange,
  onGuestRsvpChange,
}: {
  families: NSKEventFamily[];
  guests: NSKEventGuest[];
  search: string;
  viewMode: EventsGuestsViewMode;
  onEditFamily: (family: NSKEventFamily) => void;
  onDeleteFamily: (family: NSKEventFamily) => void;
  onFamilyInvitationChange: (familyId: string, sent: boolean) => void;
  onFamilyRsvpChange: (familyId: string, status: EventGuestRsvpStatus) => void;
  onEditGuest: (g: NSKEventGuest) => void;
  onDeleteGuest: (g: NSKEventGuest) => void;
  onGuestInvitationChange: (id: string, sent: boolean) => void;
  onGuestRsvpChange: (id: string, status: EventGuestRsvpStatus) => void;
}) {
  const { t } = useI18n();
  const familySections = buildFamilyGuestSections(families, guests, search);
  const unassigned = guests.filter((g) => !g.family_id);

  return (
    <div className="space-y-8">
      {familySections.length > 0 ? (
        viewMode === "cards" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {familySections.map(({ family, members }) => (
              <li key={family.id}>
                <FamilyGuestCard
                  family={family}
                  members={members}
                  onEditFamily={onEditFamily}
                  onDeleteFamily={onDeleteFamily}
                  onFamilyInvitationChange={onFamilyInvitationChange}
                  onFamilyRsvpChange={onFamilyRsvpChange}
                />
              </li>
            ))}
          </ul>
        ) : (
          <FamilyGuestsTable
            sections={familySections}
            onEditFamily={onEditFamily}
            onDeleteFamily={onDeleteFamily}
            onFamilyInvitationChange={onFamilyInvitationChange}
            onFamilyRsvpChange={onFamilyRsvpChange}
          />
        )
      ) : null}
      {unassigned.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t.events.noFamilyGroup}</h3>
          {viewMode === "cards" ? (
            <GuestCardsGrid
              guests={unassigned}
              families={families}
              onEditGuest={onEditGuest}
              onDeleteGuest={onDeleteGuest}
              onGuestInvitationChange={onGuestInvitationChange}
              onGuestRsvpChange={onGuestRsvpChange}
            />
          ) : (
            <GuestTable
              guests={unassigned}
              families={families}
              onEditGuest={onEditGuest}
              onDeleteGuest={onDeleteGuest}
              onGuestInvitationChange={onGuestInvitationChange}
              onGuestRsvpChange={onGuestRsvpChange}
            />
          )}
        </section>
      ) : null}
    </div>
  );
}

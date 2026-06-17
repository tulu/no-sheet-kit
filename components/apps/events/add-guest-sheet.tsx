"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/components/providers/i18n-provider";
import { EVENT_GUEST_RSVP_STATUSES, type EventGuestRsvpStatus, type NSKEventFamily, type NSKEventGuest } from "@/lib/events/schema";
import { GuestFamilyCombobox, type GuestFamilySelection } from "./guest-family-combobox";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

export type GuestFormValues = {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  dietary_restrictions: string;
  family_id: string;
  new_family_name?: string;
  is_kid: boolean;
  invitation_sent: boolean;
  rsvp_status: EventGuestRsvpStatus;
};

type AddGuestSheetProps = {
  open: boolean;
  editingGuest: NSKEventGuest | null;
  families: NSKEventFamily[];
  onClose: () => void;
  onSubmit: (values: GuestFormValues) => void;
};

export function AddGuestSheet({
  open,
  editingGuest,
  families,
  onClose,
  onSubmit,
}: AddGuestSheetProps) {
  const { t } = useI18n();
  const baseId = useId();
  const isEditing = editingGuest != null;
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dietary, setDietary] = useState("");
  const [familySelection, setFamilySelection] = useState<GuestFamilySelection>({ familyId: "" });
  const [isKid, setIsKid] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<EventGuestRsvpStatus>("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingGuest) {
        setName(editingGuest.name);
        setLastName(editingGuest.last_name ?? "");
        setEmail(editingGuest.email ?? "");
        setPhone(editingGuest.phone ?? "");
        setDietary(editingGuest.dietary_restrictions ?? "");
        setFamilySelection(
          editingGuest.family_id
            ? { familyId: editingGuest.family_id }
            : { familyId: "" }
        );
        setIsKid(editingGuest.is_kid);
        setInvitationSent(editingGuest.invitation_sent);
        setRsvpStatus(editingGuest.rsvp_status);
      } else {
        setName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setDietary("");
        setFamilySelection({ familyId: "" });
        setIsKid(false);
        setInvitationSent(false);
        setRsvpStatus("pending");
      }
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingGuest]);

  function handleSubmit() {
    if (!name.trim()) {
      setError(t.events.errors.guestNameRequired);
      return;
    }
    onSubmit({
      name: name.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dietary_restrictions: dietary.trim(),
      family_id: familySelection.newFamilyName ? "" : familySelection.familyId,
      new_family_name: familySelection.newFamilyName,
      is_kid: isKid,
      invitation_sent: invitationSent,
      rsvp_status: rsvpStatus,
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[460px]">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t.events.guests.editGuest : t.events.guests.addGuest}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto px-4 pb-4">
          <Field>
            <FieldLabel htmlFor={`${baseId}-name`}>
              {t.events.fields.guestName}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-name`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={t.events.fields.guestNamePlaceholder}
              autoFocus={!isEditing}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${baseId}-last`}>{t.events.fields.guestLastName}</FieldLabel>
            <Input
              id={`${baseId}-last`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t.events.fields.guestLastNamePlaceholder}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${baseId}-email`}>{t.events.fields.guestEmail}</FieldLabel>
            <Input
              id={`${baseId}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.events.fields.guestEmailPlaceholder}
              autoComplete="email"
              autoCapitalize="off"
              autoCorrect="off"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${baseId}-phone`}>{t.events.fields.guestPhone}</FieldLabel>
            <Input
              id={`${baseId}-phone`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.events.fields.guestPhonePlaceholder}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${baseId}-dietary`}>{t.events.fields.guestDietary}</FieldLabel>
            <Textarea
              id={`${baseId}-dietary`}
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder={t.events.fields.guestDietaryPlaceholder}
              rows={2}
            />
          </Field>
          <Field>
            <FieldLabel>{t.events.fields.guestFamily}</FieldLabel>
            <GuestFamilyCombobox
              families={families}
              value={familySelection}
              onChange={setFamilySelection}
            />
          </Field>
          <Field>
            <FieldLabel>{t.events.fields.guestRsvp}</FieldLabel>
            <Select
              value={rsvpStatus}
              onValueChange={(value) => {
                if (value) setRsvpStatus(value as EventGuestRsvpStatus);
              }}
              itemToStringLabel={(value) => t.events.rsvp[value as EventGuestRsvpStatus]}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_GUEST_RSVP_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t.events.rsvp[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm font-medium">{t.events.fields.isKid}</span>
            <Switch checked={isKid} onCheckedChange={setIsKid} />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm font-medium">{t.events.invitationSent}</span>
            <Switch checked={invitationSent} onCheckedChange={setInvitationSent} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="mt-auto flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.events.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t.events.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

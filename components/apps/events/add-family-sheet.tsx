"use client";

import { useEffect, useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKEventFamily, NSKEventGuest } from "@/lib/events/schema";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

export type FamilyMemberDraft = {
  key: string;
  guestId?: string;
  name: string;
  is_kid: boolean;
};

export type FamilyFormValues = {
  familyName: string;
  members: { guestId?: string; name: string; is_kid: boolean }[];
};

type AddFamilySheetProps = {
  open: boolean;
  editingFamily: NSKEventFamily | null;
  familyGuests: NSKEventGuest[];
  onClose: () => void;
  onSubmit: (values: FamilyFormValues) => void;
};

function emptyMember(): FamilyMemberDraft {
  return { key: crypto.randomUUID(), name: "", is_kid: false };
}

function memberDraftFromGuest(guest: NSKEventGuest): FamilyMemberDraft {
  return { key: guest.id, guestId: guest.id, name: guest.name, is_kid: guest.is_kid };
}

export function AddFamilySheet({
  open,
  editingFamily,
  familyGuests,
  onClose,
  onSubmit,
}: AddFamilySheetProps) {
  const { t } = useI18n();
  const baseId = useId();
  const isEditing = editingFamily != null;
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState<FamilyMemberDraft[]>([emptyMember()]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (editingFamily) {
        setFamilyName(editingFamily.name);
        setMembers(
          familyGuests.length > 0
            ? familyGuests.map(memberDraftFromGuest)
            : [emptyMember()]
        );
      } else {
        setFamilyName("");
        setMembers([emptyMember()]);
      }
      setError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open, editingFamily, familyGuests]);

  function handleSubmit() {
    const trimmedFamily = familyName.trim();
    if (!trimmedFamily) {
      setError(t.events.errors.familyNameRequired);
      return;
    }
    const memberRows = members
      .map((m) => ({
        guestId: m.guestId,
        name: m.name.trim(),
        is_kid: m.is_kid,
      }))
      .filter((m) => m.name.length > 0);
    onSubmit({ familyName: trimmedFamily, members: memberRows });
  }

  function updateMember(key: string, patch: Partial<Pick<FamilyMemberDraft, "name" | "is_kid">>) {
    setMembers((prev) => prev.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  }

  function removeMember(key: string) {
    setMembers((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.key !== key)));
  }

  function addMemberRow() {
    setMembers((prev) => [...prev, emptyMember()]);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[460px]">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t.events.guests.editFamily : t.events.guests.addFamily}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto px-4 pb-4">
          <Field>
            <FieldLabel htmlFor={`${baseId}-family-name`}>
              {t.events.fields.familyName}
              {REQUIRED_MARK}
            </FieldLabel>
            <Input
              id={`${baseId}-family-name`}
              value={familyName}
              onChange={(e) => {
                setFamilyName(e.target.value);
                setError(null);
              }}
              placeholder={t.events.fields.familyNamePlaceholder}
              autoFocus
            />
          </Field>

          <div className="space-y-3">
            <FieldLabel>{t.events.guests.familyMembersTitle}</FieldLabel>
            {members.map((member, index) => (
              <div
                key={member.key}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
              >
                <Input
                  value={member.name}
                  onChange={(e) => updateMember(member.key, { name: e.target.value })}
                  placeholder={t.events.fields.guestNamePlaceholder}
                  aria-label={`${t.events.fields.guestName} ${index + 1}`}
                  className="min-w-0 flex-1"
                />
                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${baseId}-kid-${member.key}`}
                      checked={member.is_kid}
                      onCheckedChange={(v) => updateMember(member.key, { is_kid: v })}
                    />
                    <label htmlFor={`${baseId}-kid-${member.key}`} className="text-sm">
                      {t.events.fields.isKid}
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t.events.guests.removeFamilyMember}
                    disabled={members.length <= 1}
                    onClick={() => removeMember(member.key)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full gap-2" onClick={addMemberRow}>
              <Plus className="size-4" />
              {t.events.guests.addFamilyMember}
            </Button>
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

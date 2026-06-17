"use client";

import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useI18n } from "@/components/providers/i18n-provider";
import type { NSKEventFamily } from "@/lib/events/schema";

export type GuestFamilySelection = {
  familyId: string;
  newFamilyName?: string;
};

type FamilyOption =
  | { kind: "none"; value: "__none__"; label: string }
  | { kind: "family"; value: string; label: string }
  | { kind: "create"; value: "__create__"; label: string; createName: string };

type GuestFamilyComboboxProps = {
  families: NSKEventFamily[];
  value: GuestFamilySelection;
  onChange: (next: GuestFamilySelection) => void;
};

function selectionToOption(
  selection: GuestFamilySelection,
  families: NSKEventFamily[],
  noneLabel: string
): FamilyOption | null {
  if (selection.newFamilyName?.trim()) {
    const name = selection.newFamilyName.trim();
    return { kind: "create", value: "__create__", label: name, createName: name };
  }
  if (!selection.familyId) {
    return { kind: "none", value: "__none__", label: noneLabel };
  }
  const family = families.find((f) => f.id === selection.familyId);
  if (!family) return null;
  return { kind: "family", value: family.id, label: family.name };
}

function optionToSelection(option: FamilyOption | null): GuestFamilySelection {
  if (!option || option.kind === "none") return { familyId: "" };
  if (option.kind === "create") {
    return { familyId: "", newFamilyName: option.createName };
  }
  return { familyId: option.value };
}

export function GuestFamilyCombobox({ families, value, onChange }: GuestFamilyComboboxProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const selectedOption = selectionToOption(value, families, t.events.fields.guestFamilyNone);

  useEffect(() => {
    if (!selectedOption || selectedOption.kind === "none") {
      setQuery("");
      return;
    }
    setQuery(selectedOption.label);
  }, [value, families, t.events.fields.guestFamilyNone]);

  const trimmed = query.trim();
  const lowered = trimmed.toLocaleLowerCase();
  const noneOption: FamilyOption = {
    kind: "none",
    value: "__none__",
    label: t.events.fields.guestFamilyNone,
  };

  const matchingFamilies = families.filter((family) => {
    if (!trimmed) return true;
    return family.name.toLocaleLowerCase().includes(lowered);
  });

  const familyOptions: FamilyOption[] = matchingFamilies.map((family) => ({
    kind: "family",
    value: family.id,
    label: family.name,
  }));

  const exactExists = families.some(
    (family) => family.name.trim().toLocaleLowerCase() === lowered
  );

  const items: FamilyOption[] = [noneOption, ...familyOptions];

  if (trimmed && !exactExists) {
    items.push({
      kind: "create",
      value: "__create__",
      label: t.events.guests.createFamilyOption.replace("{name}", trimmed),
      createName: trimmed,
    });
  }

  return (
    <Combobox<FamilyOption>
      items={items}
      value={selectedOption}
      onValueChange={(next) => {
        onChange(optionToSelection(next));
        setQuery(next && next.kind !== "none" ? next.label : "");
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(item) => item.label}
      isItemEqualToValue={(a, b) => a.kind === b.kind && a.value === b.value}
      filter={null}
    >
      <ComboboxInput
        placeholder={t.events.fields.familyNamePlaceholder}
        showClear={selectedOption != null && selectedOption.kind !== "none"}
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: FamilyOption) => (
            <ComboboxItem key={`${item.kind}-${item.value}`} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>{t.events.guests.familySearchEmpty}</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}

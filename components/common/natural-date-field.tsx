"use client";

import { useEffect, useMemo, useState } from "react";
import { parseDate } from "chrono-node";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDayPickerLocale, getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

function parseISODate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toISODate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(date: Date | undefined, locale: Locale): string {
  if (!date) return "";
  return date.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseDateFromInput(text: string): Date | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const parsed = parseDate(trimmed);
  if (!parsed || Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

type NaturalDateFieldProps = {
  id: string;
  locale: Locale;
  label: string;
  hint: string;
  placeholder: string;
  valueIso: string;
  onChangeIso: (iso: string) => void;
  required?: boolean;
};

export function NaturalDateField({
  id,
  locale,
  label,
  hint,
  placeholder,
  valueIso,
  onChangeIso,
  required = false,
}: NaturalDateFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const resolvedDate = useMemo(
    () => parseDateFromInput(inputValue) ?? parseISODate(valueIso),
    [inputValue, valueIso]
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const parsedIso = parseISODate(valueIso);
      setInputValue(parsedIso ? formatDateDisplay(parsedIso, locale) : valueIso);
    });
    return () => cancelAnimationFrame(id);
  }, [valueIso, locale]);

  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id}>
        {label}
        {required ? REQUIRED_MARK : null}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            const v = e.target.value;
            setInputValue(v);
            const d = parseDateFromInput(v);
            if (d) {
              onChangeIso(toISODate(d));
            } else if (!v.trim()) {
              onChangeIso("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCalendarOpen(true);
            }
          }}
        />
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger nativeButton={false} render={<InputGroupAddon align="inline-end" />}>
            <InputGroupButton variant="ghost" size="icon-xs" aria-label={label}>
              <CalendarIcon className="size-4" />
              <span className="sr-only">{label}</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
            sideOffset={8}
            initialFocus={false}
          >
            {calendarOpen ? (
              <Calendar
                mode="single"
                locale={getDayPickerLocale(locale)}
                selected={resolvedDate}
                defaultMonth={resolvedDate}
                captionLayout="dropdown"
                onSelect={(date) => {
                  if (!date) return;
                  onChangeIso(toISODate(date));
                  setInputValue(formatDateDisplay(date, locale));
                  setCalendarOpen(false);
                }}
              />
            ) : null}
          </PopoverContent>
        </Popover>
      </InputGroup>
      <FieldDescription>{hint}</FieldDescription>
    </Field>
  );
}

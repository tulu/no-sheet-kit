"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import {
  resolveNaturalDateFullMatch,
  resolveNaturalDatePreview,
} from "@/lib/dates/natural-date-input-parse";
import { getDayPickerLocale, getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";

const REQUIRED_MARK = (
  <span className="text-destructive" aria-hidden>
    {" *"}
  </span>
);

const BLUR_COMMIT_MS = 180;

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

type NaturalDateFieldProps = {
  id: string;
  locale: Locale;
  label: string;
  hint: string;
  placeholder: string;
  valueIso: string;
  onChangeIso: (iso: string) => void;
  required?: boolean;
  /** When true, text input, calendar trigger, and popover are inactive. */
  disabled?: boolean;
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
  disabled = false,
}: NaturalDateFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [parseReferenceDate] = useState(() => new Date());
  const inputFocusedRef = useRef(false);
  const blurCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputValueRef = useRef(inputValue);
  const valueIsoRef = useRef(valueIso);

  useLayoutEffect(() => {
    inputValueRef.current = inputValue;
    valueIsoRef.current = valueIso;
  }, [inputValue, valueIso]);

  const resolvedDate =
    resolveNaturalDatePreview(inputValue, parseReferenceDate) ??
    parseISODate(valueIso.trim());

  function clearBlurCommitTimer() {
    if (blurCommitTimerRef.current) {
      clearTimeout(blurCommitTimerRef.current);
      blurCommitTimerRef.current = null;
    }
  }

  function commitInputFromBlur() {
    const trimmed = inputValueRef.current.trim();
    if (!trimmed) {
      onChangeIso("");
      setInputValue("");
      return;
    }
    const full = resolveNaturalDateFullMatch(trimmed, parseReferenceDate);
    if (full) {
      onChangeIso(toISODate(full));
      setInputValue(formatDateDisplay(full, locale));
      return;
    }
    const parsedIso = parseISODate(valueIsoRef.current.trim());
    if (parsedIso) {
      setInputValue(formatDateDisplay(parsedIso, locale));
    } else {
      setInputValue(trimmed);
    }
  }

  useEffect(() => {
    return () => clearBlurCommitTimer();
  }, []);

  useEffect(() => {
    if (!disabled) return;
    queueMicrotask(() => {
      setCalendarOpen(false);
    });
  }, [disabled]);

  useEffect(() => {
    if (inputFocusedRef.current) return;
    const id = requestAnimationFrame(() => {
      const parsedIso = parseISODate(valueIso.trim());
      setInputValue(parsedIso ? formatDateDisplay(parsedIso, locale) : valueIso.trim());
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
          disabled={disabled}
          onFocus={() => {
            clearBlurCommitTimer();
            inputFocusedRef.current = true;
          }}
          onBlur={() => {
            blurCommitTimerRef.current = setTimeout(() => {
              blurCommitTimerRef.current = null;
              inputFocusedRef.current = false;
              commitInputFromBlur();
            }, BLUR_COMMIT_MS);
          }}
          onChange={(e) => {
            const v = e.target.value;
            setInputValue(v);
            const trimmed = v.trim();
            if (!trimmed) {
              onChangeIso("");
              return;
            }
            const full = resolveNaturalDateFullMatch(trimmed, parseReferenceDate);
            if (full) {
              onChangeIso(toISODate(full));
            }
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              clearBlurCommitTimer();
              setCalendarOpen(true);
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              clearBlurCommitTimer();
              inputFocusedRef.current = false;
              commitInputFromBlur();
            }
          }}
        />
        <Popover
          open={!disabled && calendarOpen}
          onOpenChange={(next) => {
            if (disabled) return;
            if (next) clearBlurCommitTimer();
            setCalendarOpen(next);
          }}
        >
          <PopoverTrigger nativeButton={false} render={<InputGroupAddon align="inline-end" />}>
            <InputGroupButton
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={label}
              disabled={disabled}
              onMouseDown={(e) => {
                e.preventDefault();
                clearBlurCommitTimer();
              }}
            >
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
                  clearBlurCommitTimer();
                  inputFocusedRef.current = false;
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

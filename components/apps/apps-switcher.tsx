"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  CalendarHeart,
  Globe,
  Grid3X3,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

const ACCENT = "#519186";

const apps: {
  id: "loans" | "dates" | "links" | "domains";
  icon: LucideIcon;
  name: string;
}[] = [
  { id: "loans", icon: Banknote, name: "NSKLoans" },
  { id: "dates", icon: CalendarHeart, name: "NSKDates" },
  { id: "links", icon: Link2, name: "NSKLinks" },
  { id: "domains", icon: Globe, name: "NSKDomains" },
];

export function AppsSwitcher() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t.apps.switcherTitle}
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-md border border-border bg-background size-9 text-foreground"
      >
        <Grid3X3 className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed right-6 top-[4.5rem] w-[360px] rounded-[28px] border border-border bg-popover p-4 shadow-xl z-50 origin-top-right">
        <div className="mb-4">
          <p className="text-base font-semibold text-foreground text-center">{t.apps.switcherTitle}</p>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-3">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/apps/${app.id}`}
              onClick={() => setOpen(false)}
              className="flex flex-col items-center justify-start rounded-xl border border-transparent px-2 py-2 text-center hover:bg-muted transition-colors"
            >
              <app.icon className="w-8 h-8 mb-2.5" style={{ color: ACCENT }} />
              <span className="text-xs text-foreground leading-tight">{app.name}</span>
            </Link>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}

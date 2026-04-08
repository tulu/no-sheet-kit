"use client";

import { Lock, Zap, CalendarCheck, Puzzle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

const itemIcons: LucideIcon[] = [Lock, Zap, CalendarCheck, Puzzle];

export function LandingWhy() {
  const { t } = useI18n();
  const items = t.landing.why.items;

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-24 reveal">
      <h2 className="font-display text-[clamp(44px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground max-w-[600px]">
        {t.landing.why.titleStart}
        <br />
        <em className="italic text-[#519186]">{t.landing.why.titleEmphasis}</em>{" "}
        {t.landing.why.titleEnd}
      </h2>

      <div className="mt-16 border border-border rounded-xl overflow-hidden grid grid-cols-2 max-md:grid-cols-1">
        {items.map((item, i) => {
          const Icon = itemIcons[i];
          return (
            <div
              key={item.title}
              className={cn(
                "p-10",
                i < 2 && "border-b border-border",
                i === 2 && "max-md:border-b max-md:border-border",
                i % 2 === 0 && "md:border-r md:border-border"
              )}
            >
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground mb-2.5 flex items-center gap-3">
                <div className="w-8 h-8 bg-foreground dark:bg-secondary rounded-[8px] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-background dark:text-foreground" />
                </div>
                {item.title}
              </h3>
              <p className="text-base text-muted-foreground leading-[1.7] font-normal">
                {item.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

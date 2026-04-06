"use client";

import { Lock, Zap, CalendarCheck, Puzzle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const items: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Lock,
    title: "Yours alone",
    body: "Data lives in your browser's localStorage and optionally syncs to your own Google Drive. No server ever touches your information.",
  },
  {
    icon: Zap,
    title: "No backend, no fees",
    body: "100% client-side. No subscriptions, no accounts to manage, no vendor lock-in. Deploy it yourself in minutes.",
  },
  {
    icon: CalendarCheck,
    title: "Reminders that work",
    body: "Instead of push notifications that need a server, NoSheetKit creates events in your Google Calendar with email reminders built in.",
  },
  {
    icon: Puzzle,
    title: "Modular by design",
    body: "Each app is independent. Use one, use all. The shared design system makes everything feel like it belongs together.",
  },
];

export function LandingWhy() {
  return (
    <section className="max-w-[1100px] mx-auto px-6 py-24 reveal">
      <h2 className="font-display text-[clamp(44px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground max-w-[600px]">
        Built for the stuff that 
        <br />
        <em className="italic text-[#519186]">falls through</em> the cracks.
      </h2>

      <div className="mt-16 border border-border rounded-xl overflow-hidden grid grid-cols-2 max-md:grid-cols-1">
        {items.map((item, i) => (
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
                <item.icon className="w-4 h-4 text-background dark:text-foreground" />
              </div>
              {item.title}
            </h3>
            <p className="text-base text-muted-foreground leading-[1.7] font-normal">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

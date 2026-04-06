"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    n: "1",
    title: "Use it right away — no login needed",
    body: "Open the app and start adding data immediately. Everything is stored locally in your browser's localStorage. No account, no setup.",
  },
  {
    n: "2",
    title: "Optionally sign in with Google",
    body: "If you want backups or reminders, sign in with Google. This unlocks Google Drive sync and Google Calendar integration — but it's never required.",
  },
  {
    n: "3",
    title: "Back up to your own Google Drive",
    body: "When signed in, your data can be saved as JSON files in your own Drive. You own the files — NoSheetKit never stores anything on a server.",
  },
  {
    n: "4",
    title: "Get reminders via Google Calendar",
    body: "Due dates and important events create calendar entries in a dedicated NoSheetKit calendar. Requires Google sign-in.",
  },
];

export function LandingHow() {
  return (
    <section className="max-w-[1100px] mx-auto px-6 pb-24 reveal">
      <Card>
        <CardContent className="grid grid-cols-2 gap-20 items-center max-md:grid-cols-1 max-md:gap-8 py-6 px-8 max-md:py-6 max-md:px-5">
          {/* Left: heading */}
          <div>
            <h2 className="font-display text-[clamp(44px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
              Simple by design,
              <br />
              <em className="italic text-[#519186]">private</em> by default.
            </h2>
          </div>

          {/* Right: steps */}
          <div className="flex flex-col">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className={cn(
                  "flex gap-5 py-5",
                  i < steps.length - 1 && "border-b border-border"
                )}
              >
                <div className="font-display text-5xl text-[#519186]/40 leading-none flex-shrink-0 w-12 flex items-center justify-center self-stretch">
                  {step.n}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-foreground mb-1">
                    {step.title}
                  </h4>
                  <p className="text-base text-muted-foreground leading-[1.65] font-normal">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

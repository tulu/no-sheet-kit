"use client";

import { ArrowDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[120px] pb-20 relative overflow-hidden">
      {/* Radial colour blobs */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 20% 40%, rgba(81,145,134,0.07) 0%, transparent 70%)",
            "radial-gradient(ellipse 50% 60% at 80% 60%, rgba(74,58,122,0.06) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 40% at 50% 10%, rgba(42,102,68,0.05) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      {/* Background grid */}
      <div
        className="absolute inset-0 z-0 opacity-90 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-[760px]">

        <h1 className="font-display text-[clamp(56px,10vw,88px)] leading-none tracking-[-0.03em] text-foreground mb-2 opacity-0 animate-[fadeUp_0.7s_ease_forwards_0.25s]">
          Your life,
          <br />
          <em className="italic text-[#519186]">not</em> a spreadsheet.
        </h1>

        <p className="text-[clamp(20px,3vw,22px)] text-muted-foreground font-light max-w-[520px] mx-auto mt-6 leading-[1.65] opacity-0 animate-[fadeUp_0.7s_ease_forwards_0.4s]">
          NoSheetKit is a personal toolkit for the things you actually need to
          track without spreadsheets, accounts, databases,
          or monthly fees.
        </p>

        <div className="flex items-center justify-center gap-4 mt-11 flex-wrap opacity-0 animate-[fadeUp_0.7s_ease_forwards_0.55s]">
          <Button
            size="lg"
            onClick={() =>
              document
                .getElementById("apps")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <ArrowDown className="w-4 h-4" />
            Explore the apps
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open("https://github.com/tulu/no-sheet-kit", "_blank")}
          >
            View on GitHub
          </Button>
        </div>

      </div>
    </section>
  );
}

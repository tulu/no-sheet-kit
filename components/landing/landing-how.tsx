"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/components/providers/i18n-provider";

export function LandingHow() {
  const { t } = useI18n();
  const steps = t.landing.how.steps;

  return (
    <section className="max-w-[1100px] mx-auto px-6 pb-24 reveal">
      <Card>
        <CardContent className="grid grid-cols-2 gap-20 items-center max-md:grid-cols-1 max-md:gap-8 py-6 px-8 max-md:py-6 max-md:px-5">
          {/* Left: heading */}
          <div>
            <h2 className="font-display text-[clamp(44px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
              {t.landing.how.titleStart}
              <br />
              <em className="italic text-[#519186]">{t.landing.how.titleEmphasis}</em>{" "}
              {t.landing.how.titleEnd}
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

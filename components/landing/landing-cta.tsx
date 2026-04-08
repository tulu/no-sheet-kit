"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/components/providers/i18n-provider";

export function LandingCta() {
  const { t } = useI18n();

  return (
    <section className="max-w-[1100px] mx-auto px-6 pb-[120px] text-center reveal">
      <Card>
        <CardContent className="py-16 px-12 max-md:py-10 max-md:px-6">
          <h2 className="font-display text-[clamp(44px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground max-w-[480px] mx-auto mb-6">
            {t.landing.cta.titleStart}
            <br />
            <em className="italic text-[#519186]">{t.landing.cta.titleEmphasis}</em>{" "}
            {t.landing.cta.titleEnd}
          </h2>
          <p className="text-lg text-muted-foreground font-normal mb-9">
            {t.landing.cta.description}
          </p>

          <Link href="/login" className={buttonVariants({ size: "lg" }) + " mx-auto"}>
            {t.landing.cta.button}
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

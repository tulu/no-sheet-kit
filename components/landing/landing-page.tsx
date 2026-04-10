"use client";

import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingWhy } from "@/components/landing/landing-why";
import { LandingApps } from "@/components/landing/landing-apps";
import { LandingHow } from "@/components/landing/landing-how";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Separator } from "@/components/ui/separator";

export function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <ScrollReveal />
      <LandingNav />
      <LandingHero />
      <LandingWhy />
      <Separator className="mx-auto max-w-[1100px]" />
      <LandingApps />
      <Separator className="mx-auto max-w-[1100px]" />
      <LandingHow />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}

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

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <ScrollReveal />
      <LandingNav />
      <LandingHero />
      <LandingWhy />
      <Separator className="max-w-[1100px] mx-auto" />
      <LandingApps />
      <Separator className="max-w-[1100px] mx-auto" />
      <LandingHow />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}

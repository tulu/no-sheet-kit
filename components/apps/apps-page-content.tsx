"use client";

import { Banknote, CalendarHeart, Globe, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/components/providers/i18n-provider";
import { LandingFooter } from "@/components/landing/landing-footer";
import { AppsHeader } from "./apps-header";

const ACCENT = "#519186";

const apps: {
  id: "loans" | "dates" | "domains";
  icon: LucideIcon;
  name: string;
}[] = [
  { id: "loans", icon: Banknote, name: "NSKLoans" },
  { id: "dates", icon: CalendarHeart, name: "NSKDates" },
  { id: "domains", icon: Globe, name: "NSKDomains" },
];

export function AppsPageContent() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <AppsHeader />

      <section className="max-w-[1100px] w-full mx-auto px-6 pt-12 pb-16 flex-1">
        <div className="mb-10">
          <h1 className="font-display text-[clamp(40px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
            {t.apps.title}
          </h1>
          <p className="text-base text-muted-foreground mt-4 max-w-[700px]">
            {t.apps.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {apps.map((app) => {
            const copy = t.landing.apps.cards[app.id];
            return (
              <Card key={app.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <app.icon className="w-6 h-6 flex-shrink-0" style={{ color: ACCENT }} />
                    {app.name}
                  </CardTitle>
                  <CardDescription>{copy.desc}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="flex flex-col gap-2">
                    {copy.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: ACCENT }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button className="w-full" disabled>
                    {t.apps.comingSoon}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}

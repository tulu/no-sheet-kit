"use client";

import { Banknote, CalendarHeart, Globe, Link2, type LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { LandingFooter } from "@/components/landing/landing-footer";
import { AppsHeader } from "./apps-header";

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

export function AppsPageContent() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <AppsHeader />

      <section className="max-w-[1100px] w-full mx-auto px-6 pt-12 pb-16 flex-1">
        <div className="mb-10 text-center">
          <h1 className="font-display text-[clamp(40px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
            {t.apps.title}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {apps.map((app) => {
            return (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="flex items-center gap-2.5 text-lg">
                      <app.icon className="w-7 h-7 flex-shrink-0" style={{ color: ACCENT }} />
                      {app.name}
                    </CardTitle>
                    <Badge variant="secondary">{t.apps.comingSoon}</Badge>
                  </div>
                  <CardDescription>{t.apps.shortDescriptions[app.id]}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}

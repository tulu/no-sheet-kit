"use client";

import Link from "next/link";
import { ArrowRight, Banknote, CalendarHeart, Globe, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

const ACCENT = "#519186";

const apps: {
  id: string;
  icon: LucideIcon;
  name: string;
}[] = [
  {
    id: "loans",
    icon: Banknote,
    name: "NSKLoans",
  },
  {
    id: "dates",
    icon: CalendarHeart,
    name: "NSKDates",
  },
  {
    id: "domains",
    icon: Globe,
    name: "NSKDomains",
  },
];

export function LandingApps() {
  const { t } = useI18n();
  const appCopy = t.landing.apps.cards;

  return (
    <section
      id="apps"
      className="max-w-[1100px] mx-auto px-6 pt-24 pb-24 reveal"
    >
      <div className="mb-12">
        <h2 className="font-display text-[clamp(44px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
          {t.landing.apps.titleStart}
            <br />
            <em className="italic" style={{ color: ACCENT }}>{t.landing.apps.titleEmphasis}</em>{" "}
            {t.landing.apps.titleEnd}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
        {apps.map((app) => (
          <Card key={app.id} className="reveal flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <app.icon className="w-6 h-6 flex-shrink-0" style={{ color: ACCENT }} />
                {app.name}
              </CardTitle>
              <CardDescription>{appCopy[app.id as keyof typeof appCopy].desc}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="flex flex-col gap-2">
                {appCopy[app.id as keyof typeof appCopy].features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                      style={{ background: ACCENT }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Link href="/login" className={buttonVariants() + " w-full"}>
                {t.landing.apps.cta}
                <ArrowRight />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Banknote, CalendarHeart, Globe, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const ACCENT = "#519186";

const apps: {
  id: string;
  icon: LucideIcon;
  name: string;
  desc: string;
  features: string[];
}[] = [
  {
    id: "loans",
    icon: Banknote,
    name: "NSKLoans",
    desc: "Track money you lend to friends and money you borrow. Know who owes what, when it's due, and keep a clean history.",
    features: [
      "Log loans you give and receive",
      "Track partial repayments",
      "Due date reminders via Google Calendar",
      "Full repayment history",
    ],
  },
  {
    id: "celebrations",
    icon: CalendarHeart,
    name: "NSKDates",
    desc: "Never forget a birthday or anniversary again. Store important dates and let Google Calendar remind you before it's too late.",
    features: [
      "Birthdays, anniversaries, and more",
      "Recurring annual reminders",
      "Email alerts via Google Calendar",
      "Days-until countdown",
    ],
  },
  {
    id: "domains",
    icon: Globe,
    name: "NSKDomains",
    desc: "Keep tabs on all your domains in one place. Track registrars, renewal dates, DNS notes, and never lose a domain to expiry.",
    features: [
      "Domain + registrar registry",
      "Renewal date tracking",
      "Expiry alerts via Google Calendar",
      "DNS and hosting notes",
    ],
  },
];

export function LandingApps() {
  return (
    <section
      id="apps"
      className="max-w-[1100px] mx-auto px-6 pt-24 pb-24 reveal"
    >
      <div className="mb-12">
        <h2 className="font-display text-[clamp(44px,6vw,56px)] leading-[1.1] tracking-[-0.025em] text-foreground">
          Small tools,
            <br />
            <em className="italic" style={{ color: ACCENT }}>one</em> coherent kit.
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
              <CardDescription>{app.desc}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="flex flex-col gap-2">
                {app.features.map((f) => (
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
                Get started
                <ArrowRight />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

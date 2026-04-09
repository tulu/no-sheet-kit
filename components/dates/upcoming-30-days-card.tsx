"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NSKDateItem } from "@/lib/dates/schema";
import { useI18n } from "@/components/providers/i18n-provider";
import { DateTypeBadge } from "./date-type-badge";

type UpcomingItem = {
  id: string;
  label: string;
  daysLeft: number;
  typeId: NSKDateItem["type_id"];
};

type Upcoming30DaysCardProps = {
  items: NSKDateItem[];
};

function getNextDate(item: NSKDateItem, now: Date): Date | null {
  const source = new Date(`${item.date}T00:00:00`);
  if (Number.isNaN(source.getTime())) return null;

  if (!item.is_recurring) return source;

  const month = source.getMonth();
  const day = source.getDate();
  const thisYear = new Date(now.getFullYear(), month, day);
  if (thisYear >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) return thisYear;
  return new Date(now.getFullYear() + 1, month, day);
}

function toUpcoming(items: NSKDateItem[]): UpcomingItem[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  return items
    .map((item) => {
      const next = getNextDate(item, start);
      if (!next) return null;
      const delta = next.getTime() - start.getTime();
      if (delta < 0 || delta > thirtyDays) return null;
      const daysLeft = Math.round(delta / (24 * 60 * 60 * 1000));
      return {
        id: item.id,
        label: item.label,
        daysLeft,
        typeId: item.type_id,
      } satisfies UpcomingItem;
    })
    .filter((value): value is UpcomingItem => Boolean(value))
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function Upcoming30DaysCard({ items }: Upcoming30DaysCardProps) {
  const { t } = useI18n();
  const upcoming = toUpcoming(items);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{t.dates.upcomingTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.dates.upcomingEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 gap-y-2 text-sm"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <DateTypeBadge typeId={item.typeId} className="shrink-0">
                    {t.dates.types[item.typeId]}
                  </DateTypeBadge>
                  <span className="text-foreground truncate">{item.label}</span>
                </div>
                <span className="text-muted-foreground shrink-0">
                  {t.dates.daysLeft.replace("{count}", String(item.daysLeft))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

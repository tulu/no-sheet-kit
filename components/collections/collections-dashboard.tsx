"use client";

import { ChevronRight, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  countItemsByPossession,
  formatCollectionAmountNumber,
  sortCollections,
  totalCollectionValueByCurrency,
} from "@/lib/collections/collections-helpers";
import type { NSKCollection, NSKCollectionsSchema } from "@/lib/collections/schema";
import { cn } from "@/lib/utils";

export type CollectionsDashboardProps = {
  schema: NSKCollectionsSchema;
  onOpenCollection: (collectionId: string) => void;
};

export function CollectionsDashboard({ schema, onOpenCollection }: CollectionsDashboardProps) {
  const { locale, t } = useI18n();
  if (schema.collections.length === 0) return null;

  const collections = sortCollections(schema.collections);
  const by = countItemsByPossession(schema.items);
  const valueByCurrency = totalCollectionValueByCurrency(schema.items, schema.collections);
  const hasValueKpi = valueByCurrency.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <LayoutDashboard className="size-5 shrink-0" aria-hidden />
        <h2 className="text-lg font-semibold text-foreground">{t.collections.dashboard.title}</h2>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2",
          hasValueKpi ? "lg:grid-cols-3" : "lg:grid-cols-2"
        )}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.collections.dashboard.collectionsCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{collections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.collections.dashboard.itemsCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{schema.items.length}</p>
          </CardContent>
        </Card>
        {hasValueKpi ? (
          <Card className="min-h-0 sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">{t.collections.dashboard.totalValueByCurrency}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {valueByCurrency.map((row) => (
                  <li key={row.currency} className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{row.currency}</span>
                    <span className="text-xl font-semibold tracking-tight tabular-nums">
                      {formatCollectionAmountNumber(row.total, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {(["owned", "lent_out", "borrowed", "wanted"] as const).map((key) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.collections.possessionLabels[key]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{by[key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t.collections.sidebarTitle}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {collections.map((c) => (
            <li key={c.id}>
              <CollectionShortcutCard
                collection={c}
                schema={schema}
                onOpen={() => onOpenCollection(c.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CollectionShortcutCard({
  collection,
  schema,
  onOpen,
}: {
  collection: NSKCollection;
  schema: NSKCollectionsSchema;
  onOpen: () => void;
}) {
  const { t } = useI18n();
  const n = schema.items.filter((i) => i.collection_id === collection.id).length;

  return (
    <Card className="h-full border border-border/70 transition-colors hover:bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{collection.name}</CardTitle>
        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={onOpen}>
          {t.collections.dashboard.openCollection}
          <ChevronRight className="ml-1 size-4" aria-hidden />
        </Button>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        <p>{t.collections.dashboard.itemsInCollection.replace("{count}", String(n))}</p>
      </CardContent>
    </Card>
  );
}

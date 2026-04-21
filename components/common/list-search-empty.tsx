"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export type ListSearchEmptyLabels = {
  title: string;
  body: string;
  clear: string;
};

export function ListSearchEmptyState({
  labels,
  onClear,
}: {
  labels: ListSearchEmptyLabels;
  onClear: () => void;
}) {
  return (
    <Empty className="border border-border p-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle className="text-xl font-semibold text-foreground">{labels.title}</EmptyTitle>
        <EmptyDescription>{labels.body}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={onClear}>
          {labels.clear}
        </Button>
      </EmptyContent>
    </Empty>
  );
}

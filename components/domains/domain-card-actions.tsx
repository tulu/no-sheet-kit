"use client";

import { useState } from "react";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/components/providers/i18n-provider";
import { normalizeDomainSiteUrl } from "@/lib/domains/site-url";

type DomainCardActionsProps = {
  domainName: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function DomainCardActions({ domainName, onEdit, onDelete }: DomainCardActionsProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  function handleViewSite() {
    const url = normalizeDomainSiteUrl(domainName);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="size-8 shrink-0"
            aria-label={t.domains.cardActionsMenu}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-40 p-1">
        <button
          type="button"
          onClick={handleViewSite}
          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          <span>{t.domains.viewSite}</span>
          <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          <span>{t.domains.edit}</span>
          <Pencil className="size-3.5 text-muted-foreground" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
        >
          <span>{t.domains.delete}</span>
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </PopoverContent>
    </Popover>
  );
}

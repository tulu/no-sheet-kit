"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
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
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          {t.domains.viewSite}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          {t.domains.edit}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
        >
          {t.domains.delete}
        </button>
      </PopoverContent>
    </Popover>
  );
}

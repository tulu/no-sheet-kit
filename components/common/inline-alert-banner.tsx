"use client";

import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type InlineAlertBannerProps = {
  title: string;
  description: string;
  /** @default "destructive" */
  variant?: "default" | "destructive";
  className?: string;
  /** Pass `null` to hide the leading icon. @default AlertTriangle */
  icon?: LucideIcon | null;
};

export function InlineAlertBanner({
  title,
  description,
  variant = "destructive",
  className,
  icon: Icon = AlertTriangle,
}: InlineAlertBannerProps) {
  return (
    <div className={cn("shrink-0 border-b border-border px-4 py-3 md:px-6", className)}>
      <Alert variant={variant}>
        {Icon ? <Icon /> : null}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}

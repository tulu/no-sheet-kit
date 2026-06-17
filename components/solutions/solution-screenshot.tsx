"use client";

import Image from "next/image";
import { useState } from "react";
import type { AppId } from "@/lib/apps/catalog";
import { getSolutionScreenshotPath, hasApplicationScreenshot } from "@/lib/seo/app-solutions";
import { cn } from "@/lib/utils";

type SolutionScreenshotProps = {
  appId: AppId;
  placeholderTitle: string;
  placeholderHint: string;
};

export function SolutionScreenshot({
  appId,
  placeholderTitle,
  placeholderHint,
}: SolutionScreenshotProps) {
  const [imageFailed, setImageFailed] = useState(() => !hasApplicationScreenshot(appId));
  const src = getSolutionScreenshotPath(appId);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-muted/20",
        imageFailed ? "border-dashed" : null
      )}
    >
      {!imageFailed ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={src}
            alt=""
            fill
            className="origin-top-left scale-[1.5] -translate-y-[9%] object-cover object-left-top"
            onError={() => setImageFailed(true)}
            unoptimized
            sizes="(max-width: 768px) 100vw, 42rem"
          />
        </div>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-sm font-medium text-foreground">{placeholderTitle}</p>
          <p className="max-w-md text-xs text-muted-foreground">
            {placeholderHint.replaceAll("{id}", appId)}
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { buildLegalHref } from "@/lib/navigation/legal-return-url";

export function useLegalPageHref(legalPath: "/privacy" | "/terms"): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return buildLegalHref(legalPath, pathname, searchParams.toString());
}

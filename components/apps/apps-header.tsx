"use client";

import Image from "next/image";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { UserMenuPlaceholder } from "./user-menu-placeholder";

export function AppsHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="text-xl font-semibold text-foreground flex items-center gap-2.5 select-none">
        <Image src="/nsk-iso.png" alt="NoSheetKit" width={28} height={28} className="rounded-[6px]" />
        NoSheetKit
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <UserMenuPlaceholder />
      </div>
    </header>
  );
}

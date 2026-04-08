"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useI18n } from "@/components/providers/i18n-provider";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export function LandingNav() {
  const { t } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-12 max-sm:px-5 bg-background/90 backdrop-blur-md border-b border-border">
      <Link
        href="/"
        className="text-xl font-semibold text-foreground flex items-center gap-2.5 no-underline"
      >
        <Image
          src="/nsk-iso.png"
          alt="NoSheetKit"
          width={28}
          height={28}
          className="rounded-[6px]"
        />
        NoSheetKit
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <Link href="/login" className={buttonVariants({ size: "sm" })}>
          {t.landing.nav.getStarted}
        </Link>
      </div>
    </nav>
  );
}

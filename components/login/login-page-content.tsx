"use client";

import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import { LoginOptions } from "./login-options";

export function LoginPageContent() {
  const { t } = useI18n();

  return (
    <main className="max-w-[720px] mx-auto px-6 pt-6 pb-16 min-h-screen flex flex-col bg-background">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
        >
          {t.common.backToNoSheetKit}
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 w-full max-w-sm mx-auto">
        <Link href="/" className="flex flex-col items-center gap-3 no-underline">
          <Image
            src="/nsk-iso.png"
            alt="NoSheetKit"
            width={48}
            height={48}
            className="rounded-[10px]"
          />
          <span className="text-xl font-semibold text-foreground">NoSheetKit</span>
        </Link>

        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-2">{t.login.title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{t.login.description}</p>
        </div>

        <LoginOptions />

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          {t.login.legalPrefix}{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            {t.common.terms}
          </Link>{" "}
          {t.login.legalConnector}{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            {t.common.privacy}
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

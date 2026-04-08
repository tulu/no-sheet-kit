"use client";

import { useI18n } from "@/components/providers/i18n-provider";

export function LandingFooter() {
  const { t } = useI18n();
  const links = [
    { label: t.common.home, href: "/" },
    { label: t.common.github, href: "https://github.com/tulu/no-sheet-kit" },
    { label: t.common.privacy, href: "/privacy" },
    { label: t.common.terms, href: "/terms" },
  ];

  return (
    <footer className="border-t border-border px-12 py-8 max-sm:px-5 flex items-center justify-between max-md:flex-col max-md:gap-4 max-md:text-center">
      <p className="text-sm text-muted-foreground">
        {t.landing.footer.copyright}
      </p>
      <div className="flex gap-6">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={
              link.href.startsWith("http") ? "noopener noreferrer" : undefined
            }
            className="text-sm text-muted-foreground no-underline hover:text-foreground transition-colors duration-150"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

"use client";

const links = [
  { label: "GitHub", href: "https://github.com/tulu/no-sheet-kit" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-12 py-8 max-sm:px-5 flex items-center justify-between max-md:flex-col max-md:gap-4 max-md:text-center">
      <p className="text-sm text-muted-foreground">
        © 2026 NoSheetKit
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

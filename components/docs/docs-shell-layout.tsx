"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Banknote,
  CalendarDays,
  CalendarHeart,
  Cloud,
  FolderInput,
  Globe,
  HelpCircle,
  Layers,
  Link2,
  ListTodo,
  PartyPopper,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FilterSidebarDesktopAside,
  FilterSidebarMobileBar,
  FilterSidebarMobileSheet,
  type FilterSidebarItem,
} from "@/components/common/filter-sidebar";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { useI18n } from "@/components/providers/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { APP_ORDER, type AppId } from "@/lib/apps/catalog";

const APP_DOC_ICONS: Record<AppId, LucideIcon> = {
  loans: Banknote,
  dates: CalendarHeart,
  links: Link2,
  domains: Globe,
  tasks: ListTodo,
  collections: Layers,
  tracker: Activity,
  events: PartyPopper,
};

export type DocNavId =
  | "welcomeWhy"
  | "welcomeFeatures"
  | "welcomeQuickstart"
  | AppId
  | "dataGoogleCalendar"
  | "dataImportExport"
  | "dataDrive";

function isAppDocNavId(id: DocNavId): id is AppId {
  return APP_ORDER.includes(id as AppId);
}

function pathnameToDocNavId(pathname: string): DocNavId {
  if (pathname.startsWith("/docs/applications/")) {
    const seg = pathname.replace("/docs/applications/", "").split("/")[0] ?? "";
    if (APP_ORDER.includes(seg as AppId)) return seg as AppId;
  }
  if (pathname.startsWith("/docs/data/google-calendar")) return "dataGoogleCalendar";
  if (pathname.startsWith("/docs/data/import-export")) return "dataImportExport";
  if (pathname.startsWith("/docs/data/google-drive")) return "dataDrive";
  if (pathname.startsWith("/docs/welcome/why")) return "welcomeWhy";
  if (pathname.startsWith("/docs/welcome/key-features")) return "welcomeFeatures";
  if (pathname.startsWith("/docs/welcome/quickstart")) return "welcomeQuickstart";
  if (pathname === "/docs" || pathname === "/docs/") return "welcomeWhy";
  return "welcomeWhy";
}

function docNavIdToHref(id: DocNavId): string {
  if (isAppDocNavId(id)) return `/docs/applications/${id}`;
  switch (id) {
    case "welcomeWhy":
      return "/docs/welcome/why";
    case "welcomeFeatures":
      return "/docs/welcome/key-features";
    case "welcomeQuickstart":
      return "/docs/welcome/quickstart";
    case "dataGoogleCalendar":
      return "/docs/data/google-calendar";
    case "dataImportExport":
      return "/docs/data/import-export";
    case "dataDrive":
      return "/docs/data/google-drive";
    default:
      return "/docs/welcome/why";
  }
}

function docNavSectionTitle(
  t: ReturnType<typeof useI18n>["t"],
  activeId: DocNavId
): string {
  if (activeId === "welcomeWhy") return t.docs.nav.welcomeWhy;
  if (activeId === "welcomeFeatures") return t.docs.nav.welcomeFeatures;
  if (activeId === "welcomeQuickstart") return t.docs.nav.welcomeQuickstart;
  if (activeId === "dataGoogleCalendar") return t.docs.nav.dataGoogleCalendar;
  if (activeId === "dataImportExport") return t.docs.nav.dataImportExport;
  if (activeId === "dataDrive") return t.docs.nav.dataDrive;
  if (isAppDocNavId(activeId)) return t.docs.nav.applicationNames[activeId];
  return t.docs.nav.welcomeWhy;
}

export function DocsShellLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const activeId = pathnameToDocNavId(pathname ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const gw = t.docs.nav.groups.welcome;
  const ga = t.docs.nav.groups.applications;
  const gd = t.docs.nav.groups.googleAndData;

  const items: FilterSidebarItem<DocNavId>[] = [
    {
      id: "welcomeWhy",
      label: t.docs.nav.welcomeWhy,
      icon: HelpCircle,
      count: 0,
      hideCount: true,
      navGroupLabel: gw,
    },
    {
      id: "welcomeFeatures",
      label: t.docs.nav.welcomeFeatures,
      icon: Sparkles,
      count: 0,
      hideCount: true,
      navGroupLabel: gw,
    },
    {
      id: "welcomeQuickstart",
      label: t.docs.nav.welcomeQuickstart,
      icon: Rocket,
      count: 0,
      hideCount: true,
      navGroupLabel: gw,
    },
    ...APP_ORDER.map((appId) => ({
      id: appId,
      label: t.docs.nav.applicationNames[appId],
      icon: APP_DOC_ICONS[appId],
      count: 0,
      hideCount: true,
      navGroupLabel: ga,
    })),
    {
      id: "dataGoogleCalendar",
      label: t.docs.nav.dataGoogleCalendar,
      icon: CalendarDays,
      count: 0,
      hideCount: true,
      navGroupLabel: gd,
    },
    {
      id: "dataImportExport",
      label: t.docs.nav.dataImportExport,
      icon: FolderInput,
      count: 0,
      hideCount: true,
      navGroupLabel: gd,
    },
    {
      id: "dataDrive",
      label: t.docs.nav.dataDrive,
      icon: Cloud,
      count: 0,
      hideCount: true,
      navGroupLabel: gd,
    },
  ];

  const sectionTitle = docNavSectionTitle(t, activeId);

  function goToSection(id: DocNavId) {
    router.push(docNavIdToHref(id));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-12">
        <Link
          href="/docs/welcome/why"
          className="flex items-center gap-2.5 text-xl font-semibold text-foreground no-underline"
        >
          <Image
            src="/nsk-iso.png"
            alt="NoSheetKit"
            width={28}
            height={28}
            className="rounded-[6px]"
          />
          {t.docs.brandTitle}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login" className={buttonVariants({ size: "sm" })}>
            {t.landing.nav.getStarted}
          </Link>
        </div>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col pt-16">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <FilterSidebarMobileBar
            title={sectionTitle}
            onOpen={() => setMobileOpen(true)}
            openButtonAriaLabel={t.docs.openNav}
          />
          <FilterSidebarMobileSheet
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            title={t.docs.navTitle}
            items={items}
            activeId={activeId}
            onFilterChange={goToSection}
          />
          <FilterSidebarDesktopAside
            title={t.docs.navTitle}
            omitVisibleTitle
            navAriaLabel={t.docs.navTitle}
            items={items}
            activeId={activeId}
            onFilterChange={goToSection}
          />
          <main className="min-h-0 min-w-0 flex-1 overflow-auto px-6 py-6 md:px-8">{children}</main>
        </div>
        <LandingFooter />
      </div>
    </div>
  );
}

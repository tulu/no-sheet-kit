"use client";

import { useEffect, useState } from "react";
import { Database, HardDrive, Palette, Settings2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import { AppsSettingsDataManagementSection } from "@/components/apps/apps-settings-data-management-section";
import { AppsSettingsGeneralSection } from "@/components/apps/apps-settings-general-section";
import { AppsSettingsStorageSection } from "@/components/apps/apps-settings-storage-section";
import { cn } from "@/lib/utils";
import {
  FilterSidebarDesktopAside,
  FilterSidebarMobileBar,
  FilterSidebarMobileSheet,
  type FilterSidebarItem,
} from "@/components/common/filter-sidebar";

type SettingsSection = "general" | "personalization" | "storage" | "data-management";

function normalizeSection(raw: string | null): SettingsSection {
  if (raw === "personalization") return "personalization";
  if (raw === "storage") return "storage";
  if (raw === "data-management") return "data-management";
  return "general";
}

export function AppsSettingsPageContent() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = normalizeSection(searchParams.get("section"));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setThemeMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const sections: FilterSidebarItem<SettingsSection>[] = [
    { id: "general", label: t.apps.settings.sections.general, icon: Settings2, count: 0, hideCount: true },
    {
      id: "personalization",
      label: t.apps.settings.sections.personalization,
      icon: Palette,
      count: 0,
      hideCount: true,
    },
    { id: "storage", label: t.apps.settings.sections.storage, icon: HardDrive, count: 0, hideCount: true },
    {
      id: "data-management",
      label: t.apps.settings.sections.dataManagement,
      icon: Database,
      count: 0,
      hideCount: true,
    },
  ];

  function goToSection(next: SettingsSection) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", next);
    router.replace(`/apps/settings?${params.toString()}`);
  }

  const sectionTitle =
    section === "general"
      ? t.apps.settings.sections.general
      : section === "personalization"
        ? t.apps.settings.sections.personalization
        : section === "storage"
          ? t.apps.settings.sections.storage
          : t.apps.settings.sections.dataManagement;

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <FilterSidebarMobileBar
        title={sectionTitle}
        onOpen={() => setMobileSidebarOpen(true)}
        openButtonAriaLabel={t.apps.settings.openSectionsNav}
      />
      <FilterSidebarMobileSheet
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        title={t.apps.settings.sectionsTitle}
        items={sections}
        activeId={section}
        onFilterChange={goToSection}
      />
      <FilterSidebarDesktopAside
        title={t.apps.settings.sectionsTitle}
        items={sections}
        activeId={section}
        onFilterChange={goToSection}
      />
      <div className="min-w-0 flex-1 px-6 py-6 md:px-8">
        {section === "general" ? <AppsSettingsGeneralSection /> : null}
        {section === "personalization" ? (
          <div className="space-y-8">
            <section>
              <h2 className="text-base font-semibold text-foreground">{t.apps.settings.language}</h2>
              <div className="mt-2 border-b border-border" />
              <div className="mt-4">
                <LanguageSwitcher nativeNames />
              </div>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">{t.apps.settings.appearance}</h2>
              <div className="mt-2 border-b border-border" />
              <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={t.apps.settings.appearance}>
                {(["light", "dark", "system"] as const).map((mode) => {
                  const checked = themeMounted ? theme === mode : mode === "system";
                  const label =
                    mode === "light"
                      ? t.apps.settings.appearanceLight
                      : mode === "dark"
                        ? t.apps.settings.appearanceDark
                        : t.apps.settings.appearanceSystem;
                  return (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      onClick={() => setTheme(mode)}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors",
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        ) : null}
        {section === "storage" ? <AppsSettingsStorageSection /> : null}
        {section === "data-management" ? <AppsSettingsDataManagementSection /> : null}
      </div>
    </div>
  );
}

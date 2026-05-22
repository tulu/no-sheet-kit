"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { messagesByLocale } from "@/lib/i18n/messages";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  type Locale,
  normalizeLocale,
} from "@/lib/i18n/types";

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (typeof messagesByLocale)[Locale];
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const cookiePart = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${LOCALE_COOKIE_NAME}=`));
  const value = cookiePart?.split("=")[1];
  return normalizeLocale(value ? decodeURIComponent(value) : null);
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const fromLanguage = normalizeLocale(navigator.language);
  if (fromLanguage) return fromLanguage;
  const fromList = navigator.languages
    .map((entry) => normalizeLocale(entry))
    .find((entry): entry is Locale => Boolean(entry));
  return fromList ?? DEFAULT_LOCALE;
}

function resolveInitialLocale(): Locale {
  const fromCookie = readCookieLocale();
  if (fromCookie) return fromCookie;
  return detectBrowserLocale();
}

function persistLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

type I18nProviderProps = {
  children: ReactNode;
  /** From server `cookies()` so SSR and first client paint match (avoids hydration mismatches). */
  initialLocale: Locale;
};

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setLocaleState(resolveInitialLocale());
    });
    return () => cancelAnimationFrame(id);
  }, [initialLocale]);

  const value: I18nContextValue = {
    locale,
    setLocale: (next) => {
      setLocaleState(next);
      persistLocaleCookie(next);
      if (typeof document !== "undefined" && document.documentElement.lang !== next) {
        document.documentElement.lang = next;
      }
    },
    t: messagesByLocale[locale],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

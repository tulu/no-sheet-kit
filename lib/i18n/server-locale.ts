import { cookies } from "next/headers";
import { messagesByLocale } from "@/lib/i18n/messages";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, normalizeLocale, type Locale } from "@/lib/i18n/types";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value) ?? DEFAULT_LOCALE;
}

export async function getRequestMessages() {
  const locale = await getRequestLocale();
  return messagesByLocale[locale];
}

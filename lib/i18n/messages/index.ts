import { enMessages } from "./en";
import { esMessages } from "./es";
import { ptMessages } from "./pt";

export const messagesByLocale = {
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
} as const;

export type Messages =
  (typeof messagesByLocale)[keyof typeof messagesByLocale];

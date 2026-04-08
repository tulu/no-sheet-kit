import { enMessages } from "./en";
import { esMessages } from "./es";
import { ptMessages } from "./pt";

export type Messages = typeof enMessages;

export const messagesByLocale = {
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
} as const;

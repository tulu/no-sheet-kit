import type { DateTypeId } from "@/lib/dates/schema";

/**
 * Tailwind classes as string literals in `components/` so the compiler includes them in the CSS.
 * (Clases solo en `lib/*.ts` a veces no se detectan con el pipeline de Next + Tailwind v4.)
 */
export const DATE_TYPE_BADGE_CLASS: Record<DateTypeId, string> = {
  birthday: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  anniversary:
    "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  reminder:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  milestone:
    "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  memorial:
    "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300",
  other: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
};

/** Botones de evento en la vista mensual; mismos tonos que los badges + borde y hover. */
export const DATE_TYPE_CHIP_CLASS: Record<DateTypeId, string> = {
  birthday:
    "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900",
  anniversary:
    "border border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900",
  reminder:
    "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900",
  milestone:
    "border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900",
  memorial:
    "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900",
  other:
    "border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900",
};

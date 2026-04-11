/**
 * Semantic keys (e.g. domain status_id, date type_id) → shared visual tone.
 * Tailwind literals live here so the compiler keeps them (components/ tree).
 */

export type BadgeTone =
  | "emerald"
  | "neutral"
  | "amber"
  | "rose"
  | "blue"
  | "pink"
  | "violet"
  | "slate"
  | "teal";

/** Domain + date type ids and any future shared semantics (e.g. `active` reused across apps). */
const SEMANTIC_TO_TONE: Record<string, BadgeTone> = {
  active: "emerald",
  parked: "neutral",
  for_sale: "amber",
  abandoned: "rose",
  birthday: "blue",
  anniversary: "pink",
  reminder: "amber",
  milestone: "violet",
  memorial: "slate",
  other: "teal",
};

const DEFAULT_TONE: BadgeTone = "slate";

export function semanticToTone(semanticKey: string): BadgeTone {
  return SEMANTIC_TO_TONE[semanticKey] ?? DEFAULT_TONE;
}

/** For `Badge variant="outline"` + `className` (full border + surface + text). */
const TONE_OUTLINE_BADGE: Record<BadgeTone, string> = {
  emerald:
    "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  neutral: "border border-border bg-muted/60 text-muted-foreground",
  amber: "border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-400",
  rose: "border border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300",
  blue: "border border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  pink: "border border-pink-500/40 bg-pink-500/10 text-pink-800 dark:text-pink-300",
  violet: "border border-violet-500/40 bg-violet-500/10 text-violet-800 dark:text-violet-300",
  slate: "border border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  teal: "border border-teal-500/40 bg-teal-500/10 text-teal-800 dark:text-teal-300",
};

export function semanticBadgeOutlineClass(semanticKey: string): string {
  return TONE_OUTLINE_BADGE[semanticToTone(semanticKey)];
}

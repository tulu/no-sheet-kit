# NoSheetKit

A suite of simple, private mini-apps that replace the spreadsheets people use for daily tracking. Your data lives in your browser (localStorage) and can sync to your own Google Drive — no backend, no database, nothing leaving your hands unless you opt in.

## Philosophy

People end up tracking all kinds of things in sprawling spreadsheets. NoSheetKit replaces each of those use cases with a focused, purpose-built mini-app that just works — no setup, no account, no server.

- **Private by default** — data is stored in `localStorage` and not sent anywhere by default
- **Your cloud, your rules** — optional sync to the user's own Google Drive via OAuth
- **Open source** — fork it, self-host it, extend it

## Tech stack

- [Next.js 16](https://nextjs.org) — App Router, TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) — component library (Empty, Table, Alert, Sheet, etc.)
- [next-themes](https://github.com/pacocoursey/next-themes) — dark/light mode
- [date-fns](https://date-fns.org) — date utilities where needed
- [chrono-node](https://github.com/wanasit/chrono) — natural language dates in forms

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
pnpm lint    # ESLint
pnpm build   # production build
```

## Apps

| Route | Description |
|-------|-------------|
| `/` | Landing |
| `/apps` | App hub |
| `/apps/dates` | Important dates (birthdays, reminders, etc.) — grid, list, and **calendar** views |
| `/apps/domains` | Domain portfolio — grid, list, and **calendar** (expiry dates on the month grid) |
| `/apps/settings` | Language and theme |

Both data apps share the same UX patterns: **filter sidebar** (categories / status), **toolbar** (view toggles + add), **shadcn Empty** when there is nothing to show, **table** for list mode, **semantic badges** for types/status, a shared **confirm delete** dialog, and **card row actions** menus.

**Sidebar extras (same pattern as each other):**

- **Dates** — when something falls in the **next 30 days**, an extra filter **“Next 30 days”** appears at the bottom of the sidebar (with a divider and accent styling) and filters the main list.
- **Domains** — when something is **expiring within 30 days**, **“Expiring soon”** appears at the bottom (divider + destructive tone) and an **inline alert banner** can show above the content (reusable `InlineAlertBanner` in `components/common`).

**View mode** (grid / list / calendar) is persisted in a cookie per app via shared helpers in `lib/apps/view-persistence.ts` (`readAppViewCookie` / `persistAppViewCookie`).

## Project structure

```
app/                      # Next.js App Router (routes under app/)
components/
  common/                 # Cross-app UI: toolbar, month calendar grid, filter sidebar,
                          # confirm delete dialog, card actions menu, inline alert banner, etc.
  dates/                  # Dates app (page, sheets, DatesView)
  domains/                # Domains app (page, sheets, DomainsView)
  layout/                 # Site chrome
  providers/              # Theme + i18n
  ui/                     # shadcn/ui primitives
lib/
  apps/
    view-persistence.ts   # Cookie read/write for view mode (dates vs domains cookie names)
  dates/
    schema.ts             # Types + filter/view mode constants (e.g. DATES_VIEW_MODES)
    storage.ts            # localStorage read/write for dates
    dates-helpers.ts      # Calendar grid, occurrences, sort, “next 30 days” logic
  domains/
    schema.ts             # Types + DOMAINS_VIEW_MODES, etc.
    storage.ts
    domains-helpers.ts    # Expiry, calendar-day match, favicon + site URL helpers
  i18n/                   # Locales and message bundles (en, es, pt)
  utils.ts                # cn() and shared utilities
```

## Contributing

Contributions are welcome. Open an issue or a pull request.

# NoSheetKit

A suite of simple, private mini-apps that replace the spreadsheets people use for daily tracking. Your data lives in your browser (localStorage) and syncs to your own Google Drive — no backend, no database, nothing leaving your hands.

## Philosophy

People end up tracking all kinds of things in sprawling spreadsheets. NoSheetKit replaces each of those use cases with a focused, purpose-built mini-app that just works — no setup, no account, no server.

- **Private by default** — data is stored in `localStorage` and never sent anywhere
- **Your cloud, your rules** — optional sync to the user's own Google Drive via OAuth
- **Open source** — fork it, self-host it, extend it

## Tech stack

- [Next.js 16](https://nextjs.org) — App Router, TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) — component library
- [next-themes](https://github.com/pacocoursey/next-themes) — dark/light mode

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project structure

```
app/                  # Next.js App Router
  layout.tsx          # Root layout with ThemeProvider
  page.tsx            # Landing page
  globals.css         # Tailwind + shadcn CSS variables
components/
  ui/                 # shadcn/ui components
  layout/             # SiteHeader
  providers/          # ThemeProvider wrapper
lib/
  utils.ts            # cn() helper
```

## Contributing

Contributions are welcome. Open an issue or a pull request.

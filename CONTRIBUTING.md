# Contributing to NoSheetKit

Thank you for your interest in NoSheetKit. This project is a **local-first kit of mini-apps** (loans, dates, links, domains, tasks, collections, tracker, events) that run in the browser. Data stays on the device by default; optional Google sign-in adds Drive backup and Calendar reminders.

Issues and pull requests are welcome. The project is released under the [MIT License](LICENSE).

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in issues, pull requests, or discussions.

---

## Prerequisites

- **Node.js** (LTS recommended)
- **pnpm** — install dependencies with `pnpm install`

Optional: Google OAuth environment variables only if you need to test Drive backup or Calendar sync. See the [README](README.md#google-sign-in-optional) for the full env table.

---

## Local setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The `/apps` area uses a signed **httpOnly** guest cookie. In development, `NSK_AUTH_SECRET` is optional (a built-in fallback is used). Set it to a string of at least 32 characters before production deploys.

For a production check locally:

```bash
pnpm build
pnpm start
```

Lint:

```bash
pnpm lint
```

Typecheck:

```bash
npx tsc --noEmit
```

---

## Development workflow

1. **Fork** the repository (or create a branch from the default branch).
2. Make **focused** changes that match existing patterns.
3. Run checks before opening a pull request:
   - `pnpm lint`
   - `npx tsc --noEmit`
   - `pnpm build` (for non-trivial changes)
4. **Open a pull request** — GitHub pre-fills the description from [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md). Complete every section before requesting review.

Maintainers may request changes before merge.

---

## Project layout

| Area | Path |
| --- | --- |
| Mini-app routes | `app/apps/<appId>/` |
| App UI | `components/apps/<appId>/` |
| App data and helpers | `lib/<appId>/` (`schema.ts`, `storage.ts`, helpers) |
| App registry | `lib/apps/catalog.ts` |
| Backup / session keys | `lib/storage/session-storage-keys.ts` |
| i18n (UI copy) | `lib/i18n/messages/en.ts`, `es.ts`, `pt.ts` |
| Marketing / solutions copy | `lib/i18n/messages/solutions-content.ts` |
| Shared UI | `components/common/`, `components/ui/` (shadcn) |
| SEO / metadata | `lib/seo/` |

---

## Conventions

### Internationalization

- User-visible strings must be added in **English, Spanish, and Portuguese** — update `en.ts`, `es.ts`, and `pt.ts` together.
- Keep copy **plain, honest, and product-first**, matching the in-app voice.
- Solution/landing copy may also live in `solutions-content.ts`.

### Mini-apps

- Register new apps in `lib/apps/catalog.ts` and `lib/storage/session-storage-keys.ts`.
- Follow the existing storage pattern: JSON in `localStorage`, read/write via `lib/<app>/storage.ts`.
- Reuse shared building blocks where possible: `AppListToolbar`, filter sidebar, semantic badges, toasts (`lib/app-toasts.ts`).

### UI

- **shadcn/ui** + **Tailwind CSS** — see `.agents/skills/shadcn/` for component patterns in this repo.
- Prefer matching surrounding code over new abstractions or one-off helpers.

### Next.js

- This repo uses **Next.js 16** with conventions that may differ from older documentation. See [AGENTS.md](AGENTS.md) and `node_modules/next/dist/docs/` when unsure.

### Scope and safety

- Keep diffs **minimal**; avoid unrelated refactors in the same PR.
- **Never commit secrets** (`.env`, credentials, API keys).
- Regenerate demo backup with `pnpm run build:demo-zip` only when demo data should change.

---

## Pull requests

GitHub loads [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) automatically. Include:

- A short **summary** (what changed and why)
- A **test plan** (lint, typecheck, build, manual steps)
- **i18n** confirmation if user-visible copy changed
- **Screenshots or notes** for UI changes

---

## Reporting bugs and suggesting features

**Bugs:** Open a GitHub issue with steps to reproduce, expected vs actual behavior, and browser/OS if relevant.

**Features:** Describe the problem and the behavior you want. Implementation details are optional — a clear use case is enough to start a discussion.

---

## Questions

If something in this guide is unclear, open an issue or ask in your pull request. We would rather clarify the docs than leave you guessing.

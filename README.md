<p align="center">
  <img src="public/nsk-iso.svg" alt="NoSheetKit" width="96" height="96" />
</p>

<h1 align="center">NoSheetKit</h1>

<p align="center">
  <strong>Small, focused tools for everyday tracking—without spreadsheets, accounts, or a backend.</strong>
</p>

---

## Why NoSheetKit exists

People track a surprising amount of life in spreadsheets: money lent, renewal dates, bookmarks, birthdays, side-project tasks, shelves of books or games. Spreadsheets are flexible, but they are also easy to overbuild, easy to share by accident, and tied to a vendor or a file you forget to back up.

NoSheetKit is a **personal kit of mini-apps**. Each app does one job, with a consistent interface: filters, list and card views where it makes sense, and data that **stays on your device by default**. You can open the launcher and start recording in seconds—no signup wall, no database on someone else’s server.

**Why local-first:** your lists are yours. Nothing is uploaded unless you explicitly choose optional cloud features.

**Why many small apps instead of one mega sheet:** purpose-built screens reduce clutter, avoid formula errors, and make the common actions (add, filter, archive) obvious.

## What’s in the kit

Open the hub at **`/apps`** and pick a tool. Each app keeps its own data in the browser and follows the same design language so switching between them feels familiar. The hub header also shows a **local “upcoming” summary** (bell icon): items in the next **30 calendar days** drawn from your storage—**Dates** next occurrences, **Domains** renewal dates, and open **Tasks** with due dates—without calling a backend.

| App | What it’s for |
| --- | --- |
| **Loans** | Money you lent and money you borrowed, with partial payments and balances. |
| **Dates** | Birthdays, anniversaries, expirations, and one-off reminders—list, grid, and calendar views. |
| **Links** | Saved URLs with optional tags, review dates, and fetched titles where possible. |
| **Domains** | A private portfolio of names, registrars, renewal dates, and notes—with calendar-friendly expiry awareness. |
| **Tasks** | Spaces (e.g. personal vs work) with Kanban and list views, due dates, and comments. |
| **Collections** | Named collections (books, games, gear, anything) with optional price and link fields and simple “owned / lent / borrowed / wanted” tracking. |
| **Tracker** | Mark days you want to remember, organized in tracks with grid, table, and calendar views. Optional start/end times per mark. No Google Calendar sync. |

Together, these replace the “misc” tabs people bolt onto the same spreadsheet—**with clearer boundaries and less risk of mixing unrelated data.**

## Optional Google sign-in

Signing in with Google is **optional**. It exists for people who want:

- **Backups** — store your data as files you control in **your** Google Drive.  
- **Reminders** — create calendar events (for example loan due dates or birthdays) so **Google Calendar** can email you.

If you never sign in, the apps still work: everything remains in **local storage** in your browser. That’s the default privacy posture.

## Languages and appearance

The UI is available in **English**, **Spanish**, and **Portuguese**. Theme (light / dark) and language can be changed from **Settings** while you use the apps.

## Run it yourself

Use this repository if you want to self-host, fork, or contribute.

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000). For a production check: `pnpm build` and `pnpm start`. Lint: `pnpm lint`.

### Guest session (`/apps`)

The `/apps` area is gated by a signed **httpOnly** cookie. Set `NSK_AUTH_SECRET` in the environment to a **string of at least 32 characters** before deploying to production (used to sign the JWT). In local development, a built-in fallback secret is used when this variable is unset so `pnpm dev` still works.

### Google sign-in (optional)

To enable **Continue with Google**, create an OAuth 2.0 **Web application** client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), enable the **Google Drive API** and **Google Calendar API**, and set:

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `NEXT_PUBLIC_APP_URL` | **Required in production** when Google sign-in is enabled: canonical site origin (no trailing slash), e.g. `https://your-domain.com`. Used to build the OAuth redirect URI `…/api/auth/google/callback`. In development, if unset, the app derives the callback from request headers (typical for `pnpm dev`). |

Authorized redirect URI in Google Cloud must match exactly: `{NEXT_PUBLIC_APP_URL}` in production, or your dev origin when testing locally without that variable.

**OAuth scopes requested by NoSheetKit:**

- `openid`, `email`, `profile`
- `https://www.googleapis.com/auth/drive.appdata`
- `https://www.googleapis.com/auth/calendar.app.created`
- `https://www.googleapis.com/auth/calendar.calendarlist.readonly`

Calendar uses `calendar.app.created` for event/calendar operations and `calendar.calendarlist.readonly` only to detect whether the dedicated NoSheetKit calendar already exists.

**Behaviour:** After Google login, the app pulls your latest backup ZIP from Drive **app data** (hidden app folder) when present and restores it into browser storage for that Google account. **Save** in the apps header uploads a fresh ZIP and updates each app’s `last_google_sync_at`. Sign-out warns if changes were not saved yet. OAuth **refresh** tokens are kept in an **httpOnly** encrypted cookie; profile metadata for each Google `sub` can be cached in `localStorage` under `nsk_google_profile_*`.

### SEO and canonical URLs (official deployment)

Set `NEXT_PUBLIC_SITE_URL` (or `NEXT_PUBLIC_APP_URL`) to your public origin **with `www`**, e.g. `https://www.nosheetkit.com`. Canonical tags, `sitemap.xml`, Open Graph, and JSON-LD all use that base. If the env value uses the apex host `nosheetkit.com`, the app normalizes it to `www.nosheetkit.com` for SEO output.

Enable public indexing only on the canonical site: `NEXT_PUBLIC_SITE_INDEXING_ENABLED=true`. Leave it unset on forks or private deployments.

### Optional analytics

If you set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (a Google Analytics 4 measurement ID), the app can load GA **only after** the visitor accepts the in-app consent banner. If the variable is unset, no analytics script is loaded.

## Contributing

Issues and pull requests are welcome. If you change user-visible copy, keep the tone **plain, honest, and product-first**—the same voice as the in-app experience.

## License

MIT © Ruben Sosenke — see [LICENSE](LICENSE).

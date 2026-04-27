/** English SEO copy (UI i18n stays client-side; crawlers use these defaults). */
export const seoCopy = {
  home: {
    title: "NoSheetKit — Simple, private mini-apps for everyday tracking",
    description:
      "NoSheetKit is a browser-first personal kit: loans, dates, links, domains, tasks, and collections—without spreadsheets or a hosted database. Stay local by default, or sign in with Google for optional Drive backups and Calendar reminders.",
  },
  apps: {
    title: "Apps",
    description:
      "Open the NoSheetKit launcher and choose a mini-app. Data stays in your browser by default; optional Google Drive and Calendar where supported.",
  },
  dates: {
    title: "NSKDates",
    description:
      "Remember birthdays, anniversaries, and milestones in your browser. Optional Google Calendar reminders by email after you sign in.",
  },
  domains: {
    title: "NSKDomains",
    description:
      "Track domain names, registrars, renewal dates, and notes in one private portfolio view stored locally in your browser.",
  },
  loans: {
    title: "NSKLoans",
    description:
      "Track money you lent and money you borrowed, with partial payments and balances—stored privately in your browser until you export or sync.",
  },
  links: {
    title: "NSKLinks",
    description:
      "Save links with automatic metadata extraction, tags, and review status. Private by default in your browser.",
  },
  tasks: {
    title: "NSKTasks",
    description:
      "Organize tasks in spaces with a Kanban board, due dates, and comments. Local-only storage in your browser.",
  },
  collections: {
    title: "NSKCollections",
    description:
      "Track things you own, lent, borrowed, or want across named collections with a simple table—local-only in your browser.",
  },
  settings: {
    title: "Settings",
    description: "Language, appearance, account, storage usage, and data management for NoSheetKit while you use the apps.",
  },
  login: {
    title: "Get started with NoSheetKit",
    description:
      "Sign in with Google for optional Drive backups and Calendar, or continue as a guest with local storage only—no separate account required.",
  },
  privacy: {
    title: "Privacy Policy — NoSheetKit",
    description:
      "How NoSheetKit handles data: local browser storage, guest and Google sessions, optional Google Drive and Calendar scopes, and what the project does not collect on its own servers.",
  },
  terms: {
    title: "Terms of Service — NoSheetKit",
    description:
      "Terms of use for the NoSheetKit open-source toolkit: acceptable use, software disclaimer, third-party services (such as Google), and limitations of liability.",
  },
  docsWelcomeWhy: {
    title: "Documentation — Why NoSheetKit",
    description:
      "Why NoSheetKit exists: local-first browser mini-apps, optional Google Drive and Calendar, and a modular toolkit without spreadsheets or subscription lock-in.",
  },
  docsWelcomeFeatures: {
    title: "Documentation — Key features",
    description:
      "Key features across NoSheetKit: browser-first mini-apps, local storage, optional Google sync, shared UI patterns, and guest or Google sessions.",
  },
  docsWelcomeQuickstart: {
    title: "Documentation — Quickstart",
    description:
      "Start with NoSheetKit as a guest using local storage, or sign in with Google when you want Drive backups and Calendar integration where an app supports it.",
  },
  docsDataGoogleCalendar: {
    title: "Documentation — Google Calendar",
    description:
      "How NoSheetKit uses Google Calendar after sign-in: optional reminders for dates, loans, domains, and similar—using email notifications from your own Google account.",
  },
  docsDataImportExport: {
    title: "Documentation — Import & export",
    description:
      "Download and restore NoSheetKit local backups as `.zip` files from Apps → Settings → Data management. File backup stays on your device unless you separately use Drive.",
  },
  docsDataGoogleDrive: {
    title: "Documentation — Google Drive sync",
    description:
      "Save packaged backups to your Google Drive app-data folder, restore from Settings after sign-in, and manage the remote copy alongside local `.zip` exports.",
  },
  docsApplicationCollections: {
    title: "Documentation — NSKCollections",
    description:
      "NSKCollections: track things you own, lent, borrowed, or want across named collections with a simple table and local-only browser storage.",
  },
  docsApplicationDates: {
    title: "Documentation — NSKDates",
    description:
      "NSKDates: remember birthdays, anniversaries, and milestones with local storage and optional Google Calendar reminders.",
  },
  docsApplicationDomains: {
    title: "Documentation — NSKDomains",
    description:
      "NSKDomains: track domain names, registrars, renewal dates, and notes in one private portfolio view.",
  },
  docsApplicationLinks: {
    title: "Documentation — NSKLinks",
    description:
      "NSKLinks: save links with automatic metadata extraction, tags, and review status—private by default.",
  },
  docsApplicationLoans: {
    title: "Documentation — NSKLoans",
    description:
      "NSKLoans: track money you lent and borrowed, partial payments, and balances stored privately in your browser.",
  },
  docsApplicationTasks: {
    title: "Documentation — NSKTasks",
    description:
      "NSKTasks: organize tasks in spaces with a Kanban board, due dates, comments, and local-only storage.",
  },
} as const;

/** English SEO copy (UI i18n stays client-side; crawlers use these defaults). */
export const seoCopy = {
  home: {
    title: "NoSheetKit — Simple, private mini-apps for everyday tracking",
    description:
      "Private tools that run in your browser. Stay local by default, or sign in when you want cloud sync.",
  },
  apps: {
    title: "Apps",
    description:
      "Open NoSheetKit tools: track loans, remember dates, save links, and manage domains. Private by default with optional Google Drive and Calendar.",
  },
  dates: {
    title: "Dates",
    description:
      "Remember birthdays, anniversaries, and milestones. Local storage with optional Google Calendar reminders.",
  },
  domains: {
    title: "Domains",
    description:
      "Track domain names, registrars, renewal dates, and notes in one private portfolio view.",
  },
  loans: {
    title: "Loans",
    description:
      "Track money you lent and money you borrowed, with partial payments and balances stored privately in your browser.",
  },
  links: {
    title: "Links",
    description:
      "Save links with automatic metadata extraction, tags, and review status. Everything stays private by default.",
  },
  settings: {
    title: "Settings",
    description: "Language and appearance for NoSheetKit while you use the apps.",
  },
  login: {
    title: "Get started",
    description:
      "Sign in with Google for Drive sync and Calendar, or continue with local storage only—no account required.",
  },
  privacy: {
    title: "Privacy Policy",
    description: "How NoSheetKit handles your data, local storage, and optional Google integrations.",
  },
  terms: {
    title: "Terms of Service",
    description: "Terms of use for NoSheetKit.",
  },
} as const;

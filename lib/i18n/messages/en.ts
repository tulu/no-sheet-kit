export const enMessages = {
  common: {
    localeLabel: "Language",
    localeShort: {
      en: "EN",
      es: "ES",
      pt: "PT",
    },
    backToNoSheetKit: "← Back to NoSheetKit",
    home: "Home",
    getStarted: "Get started",
    privacy: "Privacy",
    terms: "Terms",
    github: "GitHub",
    or: "or",
  },
  landing: {
    nav: {
      getStarted: "Get started",
    },
    hero: {
      titleStart: "Your life,",
      titleEmphasis: "not",
      titleEnd: "a spreadsheet.",
      description:
        "NoSheetKit is a personal toolkit for the things you actually need to track without spreadsheets, accounts, databases, or monthly fees.",
      exploreApps: "Explore the apps",
      viewGithub: "View on GitHub",
    },
    why: {
      titleStart: "Built for the stuff that",
      titleEmphasis: "falls through",
      titleEnd: "the cracks.",
      items: [
        {
          title: "Yours alone",
          body: "Data lives in your browser's localStorage and optionally syncs to your own Google Drive. No server ever touches your information.",
        },
        {
          title: "No backend, no fees",
          body: "100% client-side. No subscriptions, no accounts to manage, no vendor lock-in. Deploy it yourself in minutes.",
        },
        {
          title: "Reminders that work",
          body: "Instead of push notifications that need a server, NoSheetKit creates events in your Google Calendar with email reminders built in.",
        },
        {
          title: "Modular by design",
          body: "Each app is independent. Use one, use all. The shared design system makes everything feel like it belongs together.",
        },
      ],
    },
    apps: {
      titleStart: "Small tools,",
      titleEmphasis: "one",
      titleEnd: "coherent kit.",
      cards: {
        loans: {
          desc: "Track money you lend to friends and money you borrow. Know who owes what, when it's due, and keep a clean history.",
          features: [
            "Log loans you give and receive",
            "Track partial repayments",
            "Due date reminders via Google Calendar",
            "Full repayment history",
          ],
        },
        dates: {
          desc: "Never forget a birthday or anniversary again. Store important dates and let Google Calendar remind you before it's too late.",
          features: [
            "Birthdays, anniversaries, and more",
            "Recurring annual reminders",
            "Email alerts via Google Calendar",
            "Days-until countdown",
          ],
        },
        domains: {
          desc: "Keep tabs on all your domains in one place. Track registrars, renewal dates, DNS notes, and never lose a domain to expiry.",
          features: [
            "Domain + registrar registry",
            "Renewal date tracking",
            "Expiry alerts via Google Calendar",
            "DNS and hosting notes",
          ],
        },
      },
      cta: "Get started",
    },
    how: {
      titleStart: "Simple by design,",
      titleEmphasis: "private",
      titleEnd: "by default.",
      steps: [
        {
          n: "1",
          title: "Use it right away — no login needed",
          body: "Open the app and start adding data immediately. Everything is stored locally in your browser's localStorage. No account, no setup.",
        },
        {
          n: "2",
          title: "Optionally sign in with Google",
          body: "If you want backups or reminders, sign in with Google. This unlocks Google Drive sync and Google Calendar integration — but it's never required.",
        },
        {
          n: "3",
          title: "Back up to your own Google Drive",
          body: "When signed in, your data can be saved as JSON files in your own Drive. You own the files — NoSheetKit never stores anything on a server.",
        },
        {
          n: "4",
          title: "Get reminders via Google Calendar",
          body: "Due dates and important events create calendar entries in a dedicated NoSheetKit calendar. Requires Google sign-in.",
        },
      ],
    },
    cta: {
      titleStart: "Start tracking what",
      titleEmphasis: "actually",
      titleEnd: "matters.",
      description: "Your data, your device. No accounts required.",
      button: "Get started",
    },
    footer: {
      copyright: "© 2026 NoSheetKit",
    },
  },
  login: {
    title: "Welcome",
    description:
      "Sign in to sync your data across devices via Google Drive, or continue privately with local storage only.",
    continueWithGoogle: "Continue with Google",
    continueAnonymously: "Continue without signing in",
    legalPrefix: "By continuing you agree to our",
    legalConnector: "and",
  },
  apps: {
    title: "Your apps",
    subtitle: "Choose one of the available tools. This launcher will become your personal productivity home.",
    comingSoon: "Coming soon",
    userMenu: {
      label: "User",
      profile: "Profile",
      account: "Account",
      logout: "Log out",
    },
  },
  legal: {
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: April 2026",
    },
    terms: {
      title: "Terms of Service",
      lastUpdated: "Last updated: April 2026",
    },
  },
} as const;

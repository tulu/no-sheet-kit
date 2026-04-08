import type { LegalDocument } from "./types";

export const termsEn: LegalDocument = {
  locale: "en",
  sections: [
    {
      title: "Acceptance",
      paragraphs: [
        "By using NoSheetKit, you agree to these terms. If you do not agree, do not use the application.",
      ],
    },
    {
      title: "What NoSheetKit is",
      paragraphs: [
        "NoSheetKit is a free, open-source productivity toolkit.",
        "It is provided as-is, without guarantees of uptime, accuracy, or fitness for any specific purpose.",
      ],
    },
    {
      title: "Your data responsibility",
      paragraphs: [
        "You are responsible for your own data backups and data integrity.",
        "Clearing browser storage can permanently remove local data.",
      ],
    },
    {
      title: "Google integrations",
      paragraphs: [
        "Use of Google Sign-In, Google Drive, and Google Calendar through NoSheetKit is subject to Google's terms.",
      ],
      externalLink: {
        href: "https://policies.google.com/terms",
        label: "Google Terms of Service",
      },
    },
    {
      title: "Acceptable use",
      paragraphs: [
        "You may use NoSheetKit for lawful purposes.",
        "You may not use it to abuse third-party APIs or violate applicable laws.",
      ],
    },
    {
      title: "Open source license",
      paragraphs: [
        "NoSheetKit is released under the MIT License. You may fork, modify, and self-host it under that license.",
      ],
      externalLink: {
        href: "https://github.com/tulu/no-sheet-kit",
        label: "Project repository",
      },
    },
    {
      title: "Disclaimer of warranties",
      paragraphs: [
        "NoSheetKit is provided 'as is' without warranty of any kind.",
      ],
    },
    {
      title: "Changes to these terms",
      paragraphs: [
        "These terms may be updated over time. Continued use implies acceptance of future updates.",
      ],
    },
  ],
};

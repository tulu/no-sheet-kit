import type { LegalDocument } from "./types";

export const privacyEn: LegalDocument = {
  locale: "en",
  sections: [
    {
      title: "The short version",
      paragraphs: [
        "NoSheetKit does not collect, store, or transmit your personal data to any server.",
        "Your data lives in your browser's localStorage. If you enable Google Drive sync, data is stored in your own Google account.",
      ],
    },
    {
      title: "Data storage",
      paragraphs: [
        "All app data is stored locally in your browser via localStorage.",
        "Data leaves your device only if you explicitly enable Google Drive backup.",
      ],
    },
    {
      title: "Google Sign-In (optional)",
      paragraphs: [
        "Google authentication is optional.",
        "When enabled, NoSheetKit requests only the scopes required for Drive appDataFolder access and Calendar events.",
      ],
      bullets: [
        "Read/write files in Google Drive appDataFolder (hidden app-private space).",
        "Create and manage events in a dedicated NoSheetKit calendar.",
      ],
    },
    {
      title: "Google Drive backup (optional)",
      paragraphs: [
        "Backups are saved as JSON files in appDataFolder, a hidden storage area provided by Google for app-specific data.",
        "This area is not visible in regular Drive browsing and is not shared with other apps.",
      ],
      externalLink: {
        href: "https://myaccount.google.com/permissions",
        label: "Google Account permissions",
        trailingText: "You can revoke access at any time.",
      },
    },
    {
      title: "Google Calendar reminders (optional)",
      paragraphs: [
        "When enabled, reminder events are created in a dedicated NoSheetKit calendar in your Google account.",
      ],
    },
    {
      title: "Analytics & tracking",
      paragraphs: [
        "NoSheetKit can use Google Analytics 4 only after explicit consent in the tracking banner.",
        "If you reject, analytics scripts are not loaded. If you accept, aggregate usage events may be sent to Google Analytics.",
      ],
    },
    {
      title: "Open source",
      paragraphs: ["The full source code is publicly available on GitHub."],
      externalLink: {
        href: "https://github.com/tulu/no-sheet-kit",
        label: "github.com/tulu/no-sheet-kit",
      },
    },
    {
      title: "Contact",
      paragraphs: ["For privacy questions, open an issue in the repository."],
    },
  ],
};

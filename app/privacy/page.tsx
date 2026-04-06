import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — NoSheetKit",
  description: "How NoSheetKit handles your data.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-24">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 inline-block"
      >
        ← Back to NoSheetKit
      </Link>

      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-4">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-semibold mb-3">The short version</h2>
          <p className="text-muted-foreground leading-relaxed">
            NoSheetKit does not collect, store, or transmit your personal data to any server. Your
            data lives in your browser&apos;s <code className="text-foreground bg-muted px-1 rounded text-sm">localStorage</code>. If you choose to enable Google Drive sync, your data is stored in
            your own Google Drive account — not ours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data storage</h2>
          <p className="text-muted-foreground leading-relaxed">
            All data you enter into NoSheetKit is stored locally in your
            browser using the Web Storage API (<code className="text-foreground bg-muted px-1 rounded text-sm">localStorage</code>). This data never leaves
            your device unless you explicitly enable Google Drive backup.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Google Sign-In (optional)</h2>
          <p className="text-muted-foreground leading-relaxed">
            Signing in with Google is entirely optional. If you choose to sign in, NoSheetKit uses
            OAuth 2.0 to authenticate with Google. We only request the minimum scopes required:
          </p>
          <ul className="mt-3 space-y-1 text-muted-foreground list-disc list-inside">
            <li>Read and write files in the hidden <code className="text-foreground bg-muted px-1 rounded text-sm">appDataFolder</code> in your Google Drive — a private storage area not visible in the Drive UI and inaccessible to other apps</li>
            <li>Create and manage events in a dedicated NoSheetKit calendar</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We do not access your email, contacts, or any other Google data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Google Drive backup (optional)</h2>
          <p className="text-muted-foreground leading-relaxed">
            If enabled, your data is saved as JSON files using the Google Drive{" "}
            <code className="text-foreground bg-muted px-1 rounded text-sm">appDataFolder</code>{" "}
            scope. This is a special hidden storage area that Google provides for app-specific data
            — it does not appear anywhere in your normal Google Drive interface and cannot be
            accessed by other apps or seen by you when browsing Drive. Only NoSheetKit can read or
            write to this space.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            You can revoke this access and delete all stored data at any time from{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-[#519186] transition-colors"
            >
              Google Account → Security → Third-party apps with access to your account
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Google Calendar reminders (optional)</h2>
          <p className="text-muted-foreground leading-relaxed">
            If enabled, NoSheetKit creates calendar events in a dedicated calendar called
            &ldquo;NoSheetKit&rdquo; in your Google account. These events are managed entirely
            through Google&apos;s Calendar API. You can delete the calendar at any time from Google
            Calendar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Analytics &amp; tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            NoSheetKit does not use any analytics, tracking scripts, cookies, or third-party
            services beyond Google&apos;s OAuth infrastructure. There are no ads and no user profiling.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Open source</h2>
          <p className="text-muted-foreground leading-relaxed">
            NoSheetKit is fully open source. You can inspect the code at any time at{" "}
            <a
              href="https://github.com/tulu/no-sheet-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-[#519186] transition-colors"
            >
              github.com/tulu/no-sheet-kit
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this policy, open an issue on the GitHub repository.
          </p>
        </section>
      </div>
    </main>
  );
}

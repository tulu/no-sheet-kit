import Link from "next/link";

export const metadata = {
  title: "Terms of Service — NoSheetKit",
  description: "Terms of use for NoSheetKit.",
};

export default function TermsPage() {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-24">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 inline-block"
      >
        ← Back to NoSheetKit
      </Link>

      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-4">
        Terms of Service
      </h1>
      <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

      <div className="space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-semibold mb-3">Acceptance</h2>
          <p className="text-muted-foreground leading-relaxed">
            By using NoSheetKit, you agree to these terms. If you do not agree, please do not use
            the application.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">What NoSheetKit is</h2>
          <p className="text-muted-foreground leading-relaxed">
            NoSheetKit is a free, open-source personal productivity tool. It helps you track the
            things that matter to you — locally in your browser, with optional Google integrations.
            It is provided as-is, with no guarantees of uptime, accuracy, or fitness for any
            particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Your data</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for your own data. Since NoSheetKit stores data in your browser&apos;s{" "}
            <code className="text-foreground bg-muted px-1 rounded text-sm">localStorage</code>,
            clearing your browser data will permanently delete it. We strongly recommend enabling
            Google Drive backup if data persistence is important to you. When enabled, data is saved
            to a hidden Application Data folder in your Drive — invisible to you but restorable by
            the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Google integrations</h2>
          <p className="text-muted-foreground leading-relaxed">
            Use of Google Sign-In, Google Drive, and Google Calendar through NoSheetKit is subject
            to{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-[#519186] transition-colors"
            >
              Google&apos;s Terms of Service
            </a>
            . NoSheetKit is not affiliated with Google.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Acceptable use</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may use NoSheetKit for personal, non-commercial purposes. You may not use it to
            store illegal content, attempt to reverse-engineer protected systems, or abuse Google&apos;s
            API quotas in a way that affects other users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Open source license</h2>
          <p className="text-muted-foreground leading-relaxed">
            NoSheetKit is released under the MIT License. You are free to fork, modify, and
            self-host it. See the{" "}
            <a
              href="https://github.com/tulu/no-sheet-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-[#519186] transition-colors"
            >
              GitHub repository
            </a>{" "}
            for the full license text.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Disclaimer of warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            NoSheetKit is provided &ldquo;as is&rdquo; without warranty of any kind. The authors
            are not liable for any data loss, financial decisions made based on the app, or any
            other damages arising from its use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Changes to these terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            These terms may be updated from time to time. Continued use of NoSheetKit after changes
            constitutes acceptance of the new terms.
          </p>
        </section>

      </div>
    </main>
  );
}

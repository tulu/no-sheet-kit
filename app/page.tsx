import { SiteHeader } from "@/components/layout/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              No spreadsheets.
              <br />
              Just simple tools.
            </h1>
            <p className="text-lg text-muted-foreground">
              NoSheetKit is a suite of private mini-apps for daily tracking.
              Your data lives in your browser and syncs to your own Google
              Drive — nothing leaves your hands.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Open source. Your data, your device.
      </footer>
    </>
  );
}

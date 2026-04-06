import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginOptions } from "@/components/login/login-options";

export const metadata: Metadata = {
  title: "Get started — NoSheetKit",
  description: "Sign in with Google or continue without an account.",
};

export default function LoginPage() {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-24 min-h-screen flex flex-col bg-background">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 inline-block"
      >
        ← Back to NoSheetKit
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 w-full max-w-sm mx-auto">
        <Link href="/" className="flex flex-col items-center gap-3 no-underline">
          <Image
            src="/nsk-iso.png"
            alt="NoSheetKit"
            width={48}
            height={48}
            className="rounded-[10px]"
          />
          <span className="text-xl font-semibold text-foreground">NoSheetKit</span>
        </Link>

        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-2">Welcome</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sign in to sync your data across devices via Google Drive,
            or continue privately with local storage only.
          </p>
        </div>

        <LoginOptions />

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

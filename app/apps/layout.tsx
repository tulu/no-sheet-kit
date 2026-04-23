import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppsShellLayout } from "@/components/apps/apps-shell-layout";
import { NSK_SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/auth/session-token";
import {
  SESSION_SUFFIX_ANONYMOUS,
  googleSessionSuffixFromSub,
} from "@/lib/storage/session-storage-keys";

export default async function AppsLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get(NSK_SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionJwt(token);
  const showAnonymousBanner = session?.kind === "anonymous";
  const sessionKind = session?.kind === "google" ? "google" : "anonymous";
  const storageSuffix =
    session?.kind === "google" ? googleSessionSuffixFromSub(session.sub) : SESSION_SUFFIX_ANONYMOUS;
  const googleEmail = session?.kind === "google" ? session.email : undefined;
  const googleSub = session?.kind === "google" ? session.sub : undefined;
  const googleName = session?.kind === "google" ? session.name : undefined;
  const googlePicture = session?.kind === "google" ? session.picture : undefined;

  return (
    <AppsShellLayout
      showAnonymousBanner={showAnonymousBanner}
      sessionKind={sessionKind}
      storageSuffix={storageSuffix}
      googleEmail={googleEmail}
      googleSub={googleSub}
      googleName={googleName}
      googlePicture={googlePicture}
    >
      {children}
    </AppsShellLayout>
  );
}

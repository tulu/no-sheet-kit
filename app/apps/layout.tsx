import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppsShellLayout } from "@/components/apps/apps-shell-layout";
import { NSK_SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/auth/session-token";

export default async function AppsLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get(NSK_SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionJwt(token);
  const showAnonymousBanner = session?.kind === "anonymous";

  return <AppsShellLayout showAnonymousBanner={showAnonymousBanner}>{children}</AppsShellLayout>;
}

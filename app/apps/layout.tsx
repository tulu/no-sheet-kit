import type { ReactNode } from "react";
import { AppsShellLayout } from "@/components/apps/apps-shell-layout";

export default function AppsLayout({ children }: { children: ReactNode }) {
  return <AppsShellLayout>{children}</AppsShellLayout>;
}

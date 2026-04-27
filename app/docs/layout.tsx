import type { ReactNode } from "react";
import { DocsShellLayout } from "@/components/docs/docs-shell-layout";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShellLayout>{children}</DocsShellLayout>;
}

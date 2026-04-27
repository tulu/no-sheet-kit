import { redirect } from "next/navigation";

/** Default docs entry: Welcome → Why NoSheetKit */
export default function DocsIndexPage() {
  redirect("/docs/welcome/why");
}

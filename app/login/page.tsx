import { Metadata } from "next";
import { LoginPageContent } from "@/components/login/login-page-content";

export const metadata: Metadata = {
  title: "Get started — NoSheetKit",
  description: "Sign in with Google or continue without an account.",
};

export default function LoginPage() {
  return <LoginPageContent />;
}

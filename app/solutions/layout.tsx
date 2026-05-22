import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-hidden">
      <ScrollReveal />
      <LandingNav />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}

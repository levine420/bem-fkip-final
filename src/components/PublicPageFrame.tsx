import type { ReactNode } from "react";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicNavbar } from "@/components/PublicNavbar";

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grain relative min-h-screen overflow-x-hidden bg-background">
      {/* Global top seamless ambient backdrop glow across ALL public pages */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[52rem] bg-gradient-to-b from-primary/40 via-accent/25 to-transparent blur-3xl z-0" />
      <div className="orb -left-24 -top-24 size-[46rem] bg-primary/40 z-0" />
      <div className="orb right-[-10%] top-0 size-[46rem] bg-accent/30 z-0" />

      <PublicNavbar />
      <main className="relative z-10">{children}</main>
      <PublicFooter />
    </div>
  );
}

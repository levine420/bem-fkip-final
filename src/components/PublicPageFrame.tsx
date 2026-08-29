import type { ReactNode } from "react";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicNavbar } from "@/components/PublicNavbar";

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grain relative min-h-dvh bg-background">
      {/*
        Orb container: overflow:clip isolates orbs so they cannot extend
        above y=0 (which Chrome Android reveals during overscroll).
        No position:fixed children here — navbar lives outside this div.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[52rem] overflow-clip"
        style={{ zIndex: 0 }}
      >
        {/* Ambient gradient glow */}
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/40 via-accent/25 to-transparent blur-3xl" />
        {/* Left orb — clamped to top:0 so it never goes above viewport */}
        <div className="orb left-[-6rem] top-0 size-[46rem] bg-primary/40" />
        {/* Right orb */}
        <div className="orb right-[-10%] top-0 size-[46rem] bg-accent/30" />
      </div>

      <PublicNavbar />
      <main className="relative z-10">{children}</main>
      <PublicFooter />
    </div>
  );
}

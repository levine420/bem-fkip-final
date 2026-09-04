import type { ReactNode } from "react";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicNavbar } from "@/components/PublicNavbar";

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell relative isolate overflow-x-clip">
      {/* Header fade overlay - very subtle */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-gradient-to-b from-[#0b0710]/80 to-transparent" />
      
      <PublicNavbar />
      
      <main className="grain relative z-10 pt-16">{children}</main>
      
      <PublicFooter />
    </div>
  );
}

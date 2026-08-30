import type { ReactNode } from "react";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicNavbar } from "@/components/PublicNavbar";

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <div className="grain relative min-h-dvh">
        <main className="relative z-10 pt-16">{children}</main>
        <PublicFooter />
      </div>
    </>
  );
}

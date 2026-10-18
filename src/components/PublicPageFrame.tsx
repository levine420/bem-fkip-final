import type { ReactNode } from "react";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicNavbar } from "@/components/PublicNavbar";

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell">

      <PublicNavbar />

      <main id="main-content" tabIndex={-1}>{children}</main>

      <PublicFooter />
    </div>
  );
}

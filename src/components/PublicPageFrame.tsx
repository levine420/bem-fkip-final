import type { ReactNode } from "react";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicNavbar } from "@/components/PublicNavbar";

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen bg-background">
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}

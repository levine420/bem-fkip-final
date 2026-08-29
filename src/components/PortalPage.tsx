import type { ReactNode } from "react";
import { portalNavigation } from "@/config/site";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { StudentLogoutButton } from "@/components/StudentLogoutButton";

export function PortalPage({
  activeHref,
  title,
  description,
  children,
}: {
  activeHref: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <WorkspaceShell
      productLabel="Portal Mahasiswa"
      title={title}
      description={description}
      navigation={portalNavigation}
      activeHref={activeHref}
      exitHref="/"
      exitLabel="Kembali ke Website"
      mobileBottomNavigation
      extraSidebarAction={<StudentLogoutButton />}
    >
      {children}
    </WorkspaceShell>
  );
}

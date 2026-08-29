import type { ReactNode } from "react";
import { adminNavigation } from "@/config/site";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireAdminPage } from "@/server/admin/auth";
import { LogoutButton } from "@/components/admin/AuthForm";
const privileged = new Set(["/admin/organisasi/periode", "/admin/organisasi/struktur", "/admin/pengguna/admin", "/admin/program-studi", "/admin/activity-log", "/admin/pengaturan", "/admin/layanan/aspirasi"]);
export async function AdminPage({ activeHref, title, description, children, superOnly = false }: {
  activeHref: string; title: string; description: string; children: ReactNode; superOnly?: boolean;
}) {
  const actor = await requireAdminPage();
  const denied = actor.role !== "SUPER_ADMIN" && (superOnly || privileged.has(activeHref));
  const navigation = adminNavigation.filter((item) => actor.role === "SUPER_ADMIN" || !privileged.has(item.href));
  return <WorkspaceShell productLabel="Admin Control Center" title={title} description={description} navigation={navigation} activeHref={activeHref} exitHref="/" exitLabel="Website Publik">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2"><p className="text-sm text-muted-foreground">{actor.name} · {actor.role === "SUPER_ADMIN" ? "Super Admin" : "Admin Departemen"}</p><LogoutButton /></div>
    {denied ? <section role="alert" className="glass rounded-3xl p-6"><h2 className="font-semibold">Akses terbatas</h2><p className="mt-2 text-muted-foreground">Modul ini hanya dapat diakses Super Admin.</p></section> : children}
  </WorkspaceShell>;
}

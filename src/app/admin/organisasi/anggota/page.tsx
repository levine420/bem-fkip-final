import { AdminPage } from "@/components/AdminPage";
import { OrganizationManager } from "@/components/admin/OrganizationManager";
export default function Page() {
  return <AdminPage activeHref="/admin/organisasi/anggota" title="Anggota Departemen" description="Roster anggota terpisah dari struktur pengurus dan akses akun Admin."><OrganizationManager kind="department-members" /></AdminPage>;
}

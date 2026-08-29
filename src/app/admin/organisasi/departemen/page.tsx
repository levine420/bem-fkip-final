import { AdminPage } from "@/components/AdminPage";
import { OrganizationManager } from "@/components/admin/OrganizationManager";
export default function Page() {
  return <AdminPage activeHref="/admin/organisasi/departemen" title="Manajemen Departemen" description="Kelola identitas departemen, deskripsi, dan logo sesuai periode dan kewenangan."><OrganizationManager kind="departments" /></AdminPage>;
}

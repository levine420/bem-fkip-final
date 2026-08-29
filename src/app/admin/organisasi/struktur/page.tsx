import { AdminPage } from "@/components/AdminPage";
import { OrganizationManager } from "@/components/admin/OrganizationManager";
export default function Page() {
  return <AdminPage superOnly activeHref="/admin/organisasi/struktur" title="Manajemen Struktur Kepengurusan" description="Struktur resmi dan pengurus inti lintas departemen, khusus Super Admin."><OrganizationManager kind="board-members" /></AdminPage>;
}

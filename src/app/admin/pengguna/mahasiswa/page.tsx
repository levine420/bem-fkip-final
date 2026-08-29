import { AdminPage } from "@/components/AdminPage";
import { UserManager } from "@/components/admin/UserManager";
export default function Page() {
  return <AdminPage superOnly activeHref="/admin/pengguna/admin" title="Pengguna Mahasiswa" description="Khusus Super Admin. Identitas, penugasan, dan perubahan akses diperiksa di server."><UserManager cohort="students" /></AdminPage>;
}

import { AdminPage } from "@/components/AdminPage";
import { PeriodManager } from "@/components/admin/PeriodManager";
export default function PeriodManagementPage() {
  return <AdminPage superOnly activeHref="/admin/organisasi/periode" title="Manajemen Periode" description="Satu periode aktif. Riwayat kepengurusan tetap utuh, akses pengurus mengikuti masa tugas."><PeriodManager /></AdminPage>;
}

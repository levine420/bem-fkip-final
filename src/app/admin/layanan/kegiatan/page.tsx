import { AdminPage } from "@/components/AdminPage";
import { KegiatanManager } from "@/components/admin/KegiatanManager";

export default function AdminActivitiesPage() {
  return (
    <AdminPage
      activeHref="/admin/layanan/kegiatan"
      title="Manajemen Kegiatan & Peserta"
      description="Membuat kegiatan, mengatur pendaftaran, mengelola pendaftar, mengubah status presensi, dan mengekspor data peserta."
    >
      <KegiatanManager />
    </AdminPage>
  );
}

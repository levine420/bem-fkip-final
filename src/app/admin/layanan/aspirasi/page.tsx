import { AdminPage } from "@/components/AdminPage";
import { AspirasiManager } from "@/components/admin/AspirasiManager";

export default function AdminAspirationsPage() {
  return (
    <AdminPage
      superOnly
      activeHref="/admin/layanan/aspirasi"
      title="Manajemen Bank Aspirasi"
      description="Super Admin dan Tim Advokesma mengelola dan memberikan tanggapan privat terhadap aspirasi mahasiswa."
    >
      <AspirasiManager />
    </AdminPage>
  );
}

import { AdminPage } from "@/components/AdminPage";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  return (
    <AdminPage
      superOnly
      activeHref="/admin/pengaturan"
      title="Pengaturan Website & Visual Banner"
      description="Kelola spanduk visual banner utama homepage, logo platform, dan konfigurasi tampilan website publik."
    >
      <SettingsForm />
    </AdminPage>
  );
}

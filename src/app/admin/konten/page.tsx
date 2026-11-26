import { AdminPage } from "@/components/AdminPage";
import { ContentManager } from "@/components/admin/ContentManager";

export default function AdminContentPage() {
  return <AdminPage activeHref="/admin/konten" title="Manajemen Konten" description="Kelola berita, pengumuman, dan kajian. Admin Departemen membuat draf. Super Admin mereview dan menerbitkan."><ContentManager /></AdminPage>;
}

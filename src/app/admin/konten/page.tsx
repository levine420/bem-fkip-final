import { AdminPage } from "@/components/AdminPage";
import { ContentManager } from "@/components/admin/ContentManager";

export default function AdminContentPage() {
  return <AdminPage activeHref="/admin/konten" title="Manajemen Konten" description="Berita dan pengumuman menggunakan workflow Draf → Menunggu Review → Terbit / Revisi."><ContentManager /></AdminPage>;
}

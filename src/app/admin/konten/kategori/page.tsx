import { AdminPage } from "@/components/AdminPage";
import { ModuleIntro } from "@/components/ModuleIntro";

export default function ContentCategoriesPage() {
  return <AdminPage activeHref="/admin/konten" title="Kategori Konten" description="Kategori inti pada Physical ERD: BERITA, PENGUMUMAN, KAJIAN, RILIS_PERS, dan LAINNYA."><ModuleIntro title="Kategori" description="Pada baseline database kategori berbentuk enum content_category. Halaman ini dipertahankan sesuai Sitemap sebagai titik konfigurasi bila model kategori diperluas di masa depan." /></AdminPage>;
}

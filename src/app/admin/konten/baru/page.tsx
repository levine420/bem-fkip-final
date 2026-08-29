import { AdminPage } from "@/components/AdminPage";
import { ContentEditor } from "@/components/admin/ContentEditor";

export default function NewContentPage() {
  return <AdminPage activeHref="/admin/konten" title="Buat Konten Baru" description="Editor berita/pengumuman mengikuti requirement rich text, kategori, tag, thumbnail, dan departemen penerbit."><ContentEditor mode="create" /></AdminPage>;
}

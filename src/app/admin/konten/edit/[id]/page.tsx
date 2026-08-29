import { AdminPage } from "@/components/AdminPage";
import { ModuleIntro } from "@/components/ModuleIntro";

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminPage activeHref="/admin/konten" title="Edit Konten" description="Hak edit mengikuti kepemilikan departemen dan role pengguna."><ModuleIntro title={`Konten ${id}`} description="Form edit menggunakan data dari contents. Perubahan konten terbit oleh Super Admin dicatat pada audit trail." /></AdminPage>;
}

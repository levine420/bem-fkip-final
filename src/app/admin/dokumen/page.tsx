import { AdminPage } from "@/components/AdminPage";
import { DokumenManager } from "@/components/admin/DokumenManager";

export default function AdminDocumentsPage() {
  return (
    <AdminPage
      activeHref="/admin/dokumen"
      title="Manajemen Dokumen Organisasi"
      description="Mengelola berkas publik dan arsip internal BEM FKIP UIKA."
    >
      <DokumenManager />
    </AdminPage>
  );
}

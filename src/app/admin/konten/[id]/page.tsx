import { AdminPage } from "@/components/AdminPage";
import { ContentEditor } from "@/components/admin/ContentEditor";

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminPage
      activeHref="/admin/konten"
      title="Edit Konten"
      description="Edit konten yang berstatus DRAF atau REVISI. Konten yang sudah MENUNGGU_REVIEW atau TERBIT tidak dapat diedit."
    >
      <ContentEditor mode="edit" contentId={id} />
    </AdminPage>
  );
}

import { AdminPage } from "@/components/AdminPage";
import { ContentReview } from "@/components/admin/ContentReview";

export default function ContentReviewPage() {
  return (
    <AdminPage
      superOnly
      activeHref="/admin/konten"
      title="Review Konten"
      description="Review konten yang diajukan Admin Departemen. Anda dapat menerbitkan atau meminta revisi dengan catatan."
    >
      <ContentReview />
    </AdminPage>
  );
}

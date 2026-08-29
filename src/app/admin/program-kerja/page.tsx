import { AdminPage } from "@/components/AdminPage";
import { ProgramKerjaManager } from "@/components/admin/ProgramKerjaManager";

export default function AdminProgramsPage() {
  return (
    <AdminPage
      activeHref="/admin/program-kerja"
      title="Manajemen Program Kerja"
      description="Admin Departemen mengelola program kerja departemennya; Super Admin dapat mengelola seluruh departemen."
    >
      <ProgramKerjaManager />
    </AdminPage>
  );
}

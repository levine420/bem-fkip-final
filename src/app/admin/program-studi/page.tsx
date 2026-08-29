import { AdminPage } from "@/components/AdminPage";
import { StudyProgramManager } from "@/components/admin/StudyProgramManager";
export default function Page() {
  return <AdminPage superOnly activeHref="/admin/program-studi" title="Manajemen Program Studi" description="Master program studi resmi; penghapusan tidak boleh merusak referensi akun."><StudyProgramManager /></AdminPage>;
}

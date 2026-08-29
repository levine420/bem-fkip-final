import { AuthShell } from "@/components/AuthShell";
import { AdminAuthForm, LogoutButton } from "@/components/admin/AuthForm";
import { requireAdminPage } from "@/server/admin/auth";
export default async function ChangePasswordPage() {
  await requireAdminPage(true);
  return <AuthShell eyebrow="Keamanan Akun" title="Ganti Password Admin" description="Gunakan password pribadi sebelum melanjutkan ke Control Center." footer={<LogoutButton />}><AdminAuthForm changePassword /></AuthShell>;
}

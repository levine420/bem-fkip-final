import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { AdminAuthForm } from "@/components/admin/AuthForm";
export default function AdminLoginPage() {
  return <AuthShell eyebrow="Pengurus BEM" title="Login Dashboard Admin" description="Masuk dengan akun pengurus yang diberi akses. Hak Admin mengikuti departemen dan periode aktif." footer={<span>Mahasiswa? <Link href="/auth/login" className="text-accent">Buka Portal Mahasiswa</Link></span>}><AdminAuthForm /></AuthShell>;
}

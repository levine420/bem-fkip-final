import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { ReadonlyFormNotice } from "@/components/ReadonlyFormNotice";

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="Pemulihan Akun" title="Lupa password" description="Masukkan email akun untuk menerima tautan reset password." footer={<Link href="/auth/login" className="text-accent hover:underline">Kembali ke Login</Link>}><form className="grid gap-4"><label className="text-sm font-semibold">Email<input className="form-control mt-2" type="email" disabled /></label><button type="button" aria-disabled="true" className="bg-brand min-h-12 rounded-full px-5 text-sm font-semibold opacity-70">Kirim Link Reset</button><ReadonlyFormNotice /></form></AuthShell>;
}

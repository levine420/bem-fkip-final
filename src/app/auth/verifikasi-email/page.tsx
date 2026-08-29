import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { ReadonlyFormNotice } from "@/components/ReadonlyFormNotice";

export default function VerifyEmailPage() {
  return <AuthShell eyebrow="Verifikasi Email" title="Aktivasi akun mahasiswa" description="Halaman ini menangani token verifikasi akun setelah mahasiswa membuka tautan aktivasi dari email." footer={<Link href="/auth/login" className="text-accent hover:underline">Ke halaman Login</Link>}><ReadonlyFormNotice /></AuthShell>;
}

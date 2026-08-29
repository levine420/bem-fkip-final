import { AdminPage } from "@/components/AdminPage";
import { ModuleIntro } from "@/components/ModuleIntro";
import { ReadonlyFormNotice } from "@/components/ReadonlyFormNotice";

export default function AdminProfilePage() {
  return <AdminPage activeHref="/admin/profil" title="Profil Admin" description="Pengurus mengelola profil dan password akunnya sendiri."><ModuleIntro title="Informasi Akun" description="Data diambil dari sesi admin aktif."><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Nama<input className="form-control mt-2" disabled /></label><label className="text-sm font-semibold">Email<input className="form-control mt-2" disabled /></label><div className="sm:col-span-2"><ReadonlyFormNotice /></div></div></ModuleIntro></AdminPage>;
}

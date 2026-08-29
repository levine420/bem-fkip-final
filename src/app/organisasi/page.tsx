import Link from "next/link";
import { Archive, BriefcaseBusiness, Network, UsersRound } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

const modules = [
  { icon: Network, title: "Struktur Kepengurusan", description: "Bagan pengurus pada periode aktif.", href: "/organisasi/struktur-kepengurusan" },
  { icon: UsersRound, title: "Departemen", description: "Daftar departemen, anggota, dan publikasi terkait.", href: "/organisasi/departemen" },
  { icon: BriefcaseBusiness, title: "Program Kerja", description: "Program kerja lintas departemen dan status pelaksanaannya.", href: "/organisasi/program-kerja" },
  { icon: Archive, title: "Arsip Kabinet", description: "Periode kepengurusan lama dalam mode read-only.", href: "/organisasi/arsip-kabinet" },
] as const;

export default function OrganizationPage() {
  return (
    <PublicPageFrame>
      <PublicPageHero eyebrow="Organisasi" title="Struktur organisasi yang bertahan lintas periode" description="Data organisasi dipisahkan per periode sehingga kabinet baru dapat diaktifkan tanpa menghapus sejarah kepengurusan sebelumnya." breadcrumbs={[{ label: "Organisasi" }]} />
      <section className="px-4 pb-24 sm:px-6"><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">{modules.map(({ icon: Icon, ...item }) => <Link key={item.href} href={item.href} className="glass glass-hover focus-ring rounded-3xl p-6"><Icon className="size-6 text-accent"/><h2 className="mt-4 font-display text-xl font-bold">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">{item.description}</p></Link>)}</div></section>
    </PublicPageFrame>
  );
}

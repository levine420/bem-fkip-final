import { EmptyState } from "@/components/EmptyState";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

export default function ContactPage() {
  return <PublicPageFrame><PublicPageHero eyebrow="Kontak" title="Hubungi BEM FKIP UIKA" description="Alamat sekretariat, email resmi, media sosial, dan peta dikelola dari pengaturan Admin agar informasi kontak tetap aktual." breadcrumbs={[{ label: "Kontak" }]} /><section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-7xl"><EmptyState title="Kontak resmi belum disambungkan" description="Frontend tidak menampilkan email, nomor telepon, alamat sekretariat, atau akun media sosial yang belum dikonfirmasi sebagai data resmi BEM." /></div></section></PublicPageFrame>;
}

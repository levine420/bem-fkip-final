import { EmptyState } from "@/components/EmptyState";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

export default async function ArchivedCabinetPage({ params }: { params: Promise<{ periode: string }> }) {
  const { periode } = await params;
  return <PublicPageFrame><PublicPageHero eyebrow="Arsip Kabinet" title="Detail Periode Arsip" description="Profil kabinet, struktur, program kerja, dan konten periode terdahulu ditampilkan read-only." breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Arsip Kabinet", href: "/organisasi/arsip-kabinet" }, { label: periode }]} /><section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-7xl"><EmptyState title="Periode arsip tidak ditemukan pada data source" description="Route dinamis sudah siap dan akan menggunakan identitas periode yang tersimpan di database." /></div></section></PublicPageFrame>;
}

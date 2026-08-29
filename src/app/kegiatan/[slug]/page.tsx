import { EmptyState } from "@/components/EmptyState";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicPageFrame><PublicPageHero eyebrow="Detail Kegiatan" title="Detail Kegiatan" description="Detail kegiatan memuat deskripsi, waktu, lokasi, penyelenggara, kuota, batas pendaftaran, dan status registrasi." breadcrumbs={[{ label: "Kegiatan", href: "/kegiatan/kalender" }, { label: slug }]} /><section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-7xl"><EmptyState title="Resolver kegiatan menunggu keputusan data model" description="Sitemap menggunakan slug kegiatan, sementara Physical ERD v1.1 belum memiliki kolom slug pada tabel events. URL tetap disiapkan, tetapi frontend tidak membuat slug sintetis tanpa keputusan resmi." /></div></section></PublicPageFrame>;
}

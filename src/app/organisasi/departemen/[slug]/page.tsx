import { EmptyState } from "@/components/EmptyState";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

export default async function DepartmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PublicPageFrame>
      <PublicPageHero eyebrow="Detail Departemen" title="Profil Departemen" description="Halaman detail departemen memuat deskripsi, pengurus, program kerja, publikasi terkait, galeri, dan kontak bila tersedia." breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Departemen", href: "/organisasi/departemen" }, { label: slug }]} />
      <section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-7xl"><EmptyState title="Resolver departemen menunggu keputusan data model" description="Sitemap menggunakan slug untuk URL departemen, sementara Physical ERD v1.1 tidak memiliki kolom slug pada tabel departments. Frontend tidak mengarang mapping slug ke ID sampai model data diselaraskan." /></div></section>
    </PublicPageFrame>
  );
}

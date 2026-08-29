import { PublicListing } from "@/components/PublicListing";

export default async function NewsCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicListing eyebrow="Kategori Berita" title={`Kategori: ${slug.replaceAll("-", " ")}`} description="Daftar publikasi yang difilter berdasarkan kategori konten." breadcrumbs={[{ label: "Berita", href: "/berita" }, { label: slug }]} emptyTitle="Belum ada konten dalam kategori ini" emptyDescription="Kategori route sudah tersedia. Data akan diambil dari konten berstatus Terbit pada backend." />;
}

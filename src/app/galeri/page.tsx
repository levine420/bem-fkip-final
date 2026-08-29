import { PublicListing } from "@/components/PublicListing";

export default function GalleryPage() {
  return <PublicListing eyebrow="Version 2" title="Galeri Dokumentasi" description="Galeri foto dan video kegiatan termasuk roadmap Version 2 setelah MVP stabil." breadcrumbs={[{ label: "Galeri" }]} emptyTitle="Galeri belum diaktifkan pada fase ini" emptyDescription="Fitur ini sengaja tidak dipaksakan ke MVP. Struktur route dipertahankan untuk ekspansi berikutnya." />;
}

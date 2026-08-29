import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { SurfaceCard } from "@/components/SurfaceCard";

export default function TermsPage() {
  return <PublicPageFrame><PublicPageHero eyebrow="Legal" title="Syarat & Ketentuan" description="Syarat penggunaan platform harus ditetapkan sebelum layanan autentikasi dan layanan mahasiswa dibuka secara resmi." breadcrumbs={[{ label: "Syarat & Ketentuan" }]} /><section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-5xl"><SurfaceCard><p className="text-sm leading-relaxed text-muted-foreground">Dokumentasi sumber belum memuat naskah syarat penggunaan final. Route disiapkan tanpa menambahkan ketentuan buatan.</p></SurfaceCard></div></section></PublicPageFrame>;
}

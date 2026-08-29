import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { SurfaceCard } from "@/components/SurfaceCard";

export default function PrivacyPage() {
  return <PublicPageFrame><PublicPageHero eyebrow="Legal" title="Kebijakan Privasi" description="Dokumen kebijakan privasi final perlu ditetapkan sebelum platform diluncurkan kepada pengguna nyata." breadcrumbs={[{ label: "Kebijakan Privasi" }]} /><section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-5xl"><SurfaceCard><p className="text-sm leading-relaxed text-muted-foreground">Halaman ini disiapkan sebagai bagian dari sitemap. Naskah legal belum tersedia pada dokumentasi sumber, sehingga tidak dibuatkan kebijakan fiktif.</p></SurfaceCard></div></section></PublicPageFrame>;
}

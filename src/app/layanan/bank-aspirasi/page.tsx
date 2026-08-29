import Link from "next/link";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { SurfaceCard } from "@/components/SurfaceCard";

export default function AspirationServicePage() {
  return <PublicPageFrame><PublicPageHero eyebrow="Layanan Mahasiswa" title="Bank Aspirasi" description="Kanal privat untuk mahasiswa menyampaikan aspirasi, aduan, atau saran dan memantau progres penanganannya." breadcrumbs={[{ label: "Layanan", href: "/layanan" }, { label: "Bank Aspirasi" }]} /><section className="px-4 pb-24 sm:px-6"><div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.1fr_.9fr]"><SurfaceCard><h2 className="font-display text-xl font-bold">Privasi aspirasi</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Isi aspirasi tidak dipublikasikan. Mahasiswa hanya melihat aspirasi miliknya sendiri; Admin Advokesma dan Super Admin menangani aspirasi berdasarkan kewenangan.</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Status utama: Masuk → Diproses → Selesai / Ditolak.</p></SurfaceCard><SurfaceCard><h2 className="font-display text-xl font-bold">Kirim aspirasi</h2><p className="mt-3 text-sm text-muted-foreground">Login diperlukan agar aspirasi dapat dilacak secara privat.</p><Link href="/auth/login" className="bg-brand focus-ring mt-5 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold">Masuk ke Portal</Link></SurfaceCard></div></section></PublicPageFrame>;
}

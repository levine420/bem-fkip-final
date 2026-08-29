import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

export default function ServicesPage() {
  return <PublicPageFrame><PublicPageHero eyebrow="Layanan Mahasiswa" title="Layanan digital yang dapat dilacak" description="Layanan mahasiswa ditempatkan di Portal setelah login agar data pribadi dan status layanan tetap privat." breadcrumbs={[{ label: "Layanan" }]} /><section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-7xl"><Link href="/layanan/bank-aspirasi" className="glass glass-hover block rounded-3xl p-6"><MessageSquareText className="size-6 text-accent"/><h2 className="mt-4 font-display text-xl font-bold">Bank Aspirasi</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Aspirasi, aduan, dan saran mahasiswa dikelola privat. Hanya mahasiswa pengaju serta Admin Advokesma/Super Admin yang dapat melihat isinya.</p></Link></div></section></PublicPageFrame>;
}

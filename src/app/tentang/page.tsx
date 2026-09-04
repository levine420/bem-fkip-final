import Link from "next/link";
import { History, Landmark, Network, Target } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { SurfaceCard } from "@/components/SurfaceCard";
import { EmptyState } from "@/components/EmptyState";
import { siteConfig } from "@/config/site";
import { getActivePeriod } from "@/server/public/data";

export const revalidate = 60;

const links = [
  { icon: History, title: "Sejarah BEM", text: "Riwayat singkat BEM FKIP UIKA dan kedudukannya di lingkungan fakultas.", href: "/tentang/sejarah-bem" },
  { icon: Target, title: "Visi & Misi", text: "Visi-misi kabinet aktif berasal dari Periode Kepengurusan yang diaktifkan Super Admin.", href: "/tentang/visi-misi" },
  { icon: Network, title: "Struktur Kepengurusan", text: "Jajaran inti, departemen, dan pengurus periode aktif.", href: "/organisasi/struktur-kepengurusan" },
  { icon: Landmark, title: "Arsip Kabinet", text: "Periode sebelumnya tetap dapat diakses dalam mode read-only.", href: "/organisasi/arsip-kabinet" },
] as const;

export default async function AboutPage() {
  const activePeriod = await getActivePeriod();

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Profil BEM"
        title="Mengenal BEM FKIP UIKA dan kepengurusannya"
        description="Area profil memisahkan identitas lembaga, kabinet aktif, struktur kepengurusan, dan arsip periode agar informasi organisasi tetap tertata lintas kepengurusan."
        breadcrumbs={[{ label: "Tentang" }]}
      />
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SurfaceCard>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Visi Produk</span>
            <blockquote className="mt-3 max-w-4xl font-display text-2xl font-bold leading-relaxed sm:text-3xl">“{siteConfig.productVision}”</blockquote>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Ini adalah visi Platform Digital, bukan visi kabinet aktif. Visi dan misi kabinet ditarik dari data Periode Kepengurusan.</p>
          </SurfaceCard>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {links.map(({ icon: Icon, title, text, href }) => (
              <Link key={href} href={href} className="glass glass-hover focus-ring rounded-3xl p-6">
                <span className="grid size-10 place-items-center rounded-xl border border-glass-border text-accent"><Icon className="size-5" /></span>
                <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </Link>
            ))}
          </div>

          <div className="mt-5">
            {activePeriod ? (
              <SurfaceCard>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">Periode Kepengurusan Aktif</span>
                    <h3 className="text-xl font-bold text-white mt-1">Kabinet {activePeriod.name} ({activePeriod.year_start}–{activePeriod.year_end})</h3>
                  </div>
                  <Link href="/tentang/visi-misi" className="bg-brand focus-ring inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs font-semibold text-white">
                    Lihat Visi & Misi Kabinet
                  </Link>
                </div>
              </SurfaceCard>
            ) : (
              <EmptyState title="Periode aktif belum disambungkan" description="Nama kabinet, tahun periode, visi, misi, foto, dan susunan pengurus ditarik dari data periode aktif yang dikelola Super Admin." />
            )}
          </div>
        </div>
      </section>
    </PublicPageFrame>
  );
}

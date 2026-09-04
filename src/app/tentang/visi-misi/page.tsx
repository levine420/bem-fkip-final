import Image from "next/image";
import Link from "next/link";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { EmptyState } from "@/components/EmptyState";
import { getActivePeriod } from "@/server/public/data";
import { Target, Eye, ArrowRight } from "lucide-react";

export const revalidate = 60;

export default async function VisionMissionPage() {
  const period = await getActivePeriod();

  if (!period) {
    return (
      <PublicPageFrame>
        <PublicPageHero
          eyebrow="Tentang"
          title="Visi & Misi BEM FKIP UIKA"
          description="Visi dan misi organisasi yang diaktifkan oleh Super Admin."
          breadcrumbs={[{ label: "Tentang", href: "/tentang" }, { label: "Visi & Misi" }]}
        />
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <EmptyState
              title="Periode aktif belum dikonfigurasi"
              description="Visi dan misi organisasi ditarik langsung dari data Periode Kepengurusan yang diaktifkan melalui Admin Panel."
            />
          </div>
        </section>
      </PublicPageFrame>
    );
  }

  // Parse multi-line misi string into bullet list
  const misiList = period.misi
    ? period.misi.split("\n").map((m) => m.trim()).filter(Boolean)
    : [];

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow={`Kabinet ${period.name} · ${period.year_start}–${period.year_end}`}
        title={`Visi & Misi Kabinet ${period.name}`}
        description={`Visi dan Misi Resmi BEM FKIP UIKA Kabinet ${period.name}`}
        breadcrumbs={[{ label: "Tentang", href: "/tentang" }, { label: "Visi & Misi" }]}
      />

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-10 sm:space-y-12">

          {/* Logo + Nama Kabinet */}
          <div className="flex flex-col items-center gap-6 text-center">
            {period.photo_url && (
              <div className="relative size-40 drop-shadow-2xl">
                <Image
                  src={period.photo_url}
                  alt={`Logo Kabinet ${period.name}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
                Kabinet Aktif {period.year_start}–{period.year_end}
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                KABINET <span className="text-gradient-gold">{period.name.toUpperCase()}</span>
              </h2>
            </div>
          </div>

          {/* Visi */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Eye className="size-5" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Visi</h3>
            </div>
            <div className="glass rounded-3xl border-amber-500/20 p-8 shadow-xl">
              <p className="text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
                &ldquo;{period.visi}&rdquo;
              </p>
            </div>
          </div>

          {/* Misi */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Target className="size-5" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Misi</h3>
            </div>
            {misiList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Misi belum dikonfigurasi pada periode ini.</p>
            ) : (
              <div className="grid gap-3">
                {misiList.map((misi, i) => (
                  <div key={i} className="glass flex items-start gap-5 rounded-2xl p-5 shadow-md transition hover:border-amber-500/30">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 font-display text-sm font-black text-black shadow">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed text-foreground/90">{misi}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 text-center pt-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/organisasi/struktur-kepengurusan" className="bg-brand focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:shadow-md transition">
                Struktur Kepengurusan <ArrowRight className="size-4" />
              </Link>
              <Link href="/organisasi/departemen" className="glass focus-ring inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold hover:border-accent/50 transition">
                Lihat Departemen
              </Link>
            </div>
          </div>

        </div>
      </section>
    </PublicPageFrame>
  );
}

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Send } from "lucide-react";

type Period = { name: string; year_start: number; year_end: number } | null;

export function HomeHero({ period, stats }: { period: Period; stats?: { departments: number; events: number; programs: number } }) {
  const periodLabel = period ? `Periode ${period.year_start}/${period.year_end}` : "Platform Digital";
  return (
    <section id="home" className="relative overflow-hidden border-b border-slate-800 bg-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(131_24_67/0.35),rgb(15_23_42/0.85)_55%,#020617)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="reveal space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-700/50 bg-pink-950/80 px-3 py-1 text-xs font-semibold text-pink-300">
              <span className="size-2 animate-pulse rounded-full bg-[#E11D74]" />
              Portal Resmi BEM FKIP UIKA • {periodLabel}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Kabinet{" "}
                <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {period?.name ?? "BEM FKIP UIKA"}
                </span>
              </h1>
              <p className="max-w-xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg">
                Badan Eksekutif Mahasiswa Fakultas Keguruan dan Ilmu Pendidikan Universitas Ibn Khaldun Bogor.
              </p>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Menghimpun ide, mengawal advokasi hak mahasiswa, dan menggerakkan aksi nyata untuk mencetak pendidik berintegritas dan adaptif.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/kegiatan" className="inline-flex items-center gap-2 rounded-lg bg-[#E11D74] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-pink-500/25 transition hover:-translate-y-0.5 hover:bg-[#BE185D]">
                <CalendarDays className="size-4" /> Lihat Agenda Kegiatan
              </Link>
              <Link href="/layanan/bank-aspirasi" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-800">
                <Send className="size-4 text-pink-400" /> Sampaikan Aspirasi
              </Link>
              <Link href="/organisasi/departemen" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/50 hover:text-white">
                Kenali Departemen →
              </Link>
            </div>
            {stats && (
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 sm:grid-cols-4">
                <Stat value="4 Prodi" label="Keguruan & Ilmu Pend." />
                <Stat value={`${stats.departments} Dep.`} label="Departemen Aktif" />
                <Stat value={`${stats.programs}`} label="Program Kerja" />
                <Stat value={`${stats.events}`} label="Agenda Terbit" accent />
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-800 shadow-2xl">
              <Image src="/images/kepengurusan-altiora.jpg" alt="Fungsionaris BEM FKIP UIKA" width={1200} height={900} priority className="h-80 w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02] sm:h-96" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/90 p-3.5 backdrop-blur-md">
                <div>
                  <p className="text-xs font-bold text-white">Menyatukan Asa, Menggapai Altiora</p>
                  <p className="text-[11px] text-pink-300">Pimpinan &amp; Fungsionaris BEM FKIP UIKA</p>
                </div>
                <Link href="/tentang" className="flex items-center gap-1 text-xs font-semibold text-white underline underline-offset-2 hover:text-pink-300">
                  Struktur <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-xl font-bold tracking-tight ${accent ? "text-pink-400" : "text-white"}`}>{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}

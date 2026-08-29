import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, MessageSquareText, Newspaper, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

const quickIcons = [Newspaper, CalendarDays, MessageSquareText, FileText] as const;

export function HomeHero() {
  return (
    <section id="home" className="relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
      {/* Top ambient glow behind floating navbar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#6b0f2e]/60 via-[#4a0a1f]/35 to-transparent blur-2xl" />

      {/* Atmosphere Orbs */}
      <div className="orb -left-20 -top-36 size-[36rem] bg-primary/40" />
      <div className="orb right-[-5%] -top-24 size-[38rem] bg-accent/30" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Left Column */}
        <div className="reveal">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">
            <ShieldCheck className="size-3.5 text-amber-400" /> Website Resmi & Layanan Digital Mahasiswa
          </span>
          <h1 className="mt-4 font-display text-[2.5rem] font-extrabold leading-[1.05] sm:text-6xl xl:text-[4.4rem]">
            Platform Digital
            <span className="text-gradient block">BEM FKIP UIKA</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Satu pintu untuk informasi resmi, kepengurusan, program kerja, kegiatan, dokumen, dan layanan mahasiswa yang dirancang berkelanjutan lintas periode kepengurusan.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/kegiatan/kalender" className="bg-brand focus-ring group inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-[var(--glow-pink)]">
              Lihat Kegiatan <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/tentang/visi-misi" className="glass focus-ring inline-flex min-h-12 items-center rounded-full px-6 text-sm font-semibold hover:border-amber-400 hover:text-amber-400">Tentang BEM</Link>
          </div>

          <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-2">
            {siteConfig.quickLinks.map((item, index) => {
              const Icon = quickIcons[index];
              return (
                <Link key={item.href} href={item.href} className="glass glass-hover focus-ring rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-glass-border text-accent"><Icon className="size-4" /></span>
                    <span><span className="block font-display text-sm font-bold">{item.title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.description}</span></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Original Model with Floating Badges */}
        <div className="relative mt-2 lg:mt-0">
          <div className="glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-10 flex items-center justify-center bg-gradient-to-b from-amber-500/10 via-transparent to-background/50 border border-amber-500/20 shadow-2xl min-h-[22rem] sm:min-h-[26rem]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent blur-2xl" />
            <Image
              src="/images/logo-altiora.png"
              alt="Logo Resmi Kabinet Altiora BEM FKIP UIKA"
              width={600}
              height={600}
              priority
              className="relative z-10 size-48 sm:size-64 object-contain drop-shadow-[0_10px_35px_rgba(245,158,11,0.35)] transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Floating Badge Top Left */}
          <div className="glass float-soft absolute -left-2 top-4 max-w-[15rem] rounded-2xl p-4 sm:-left-6 shadow-xl border border-amber-500/30">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400">Kabinet Aktif 2026–2027</p>
            <p className="mt-1.5 font-display text-sm font-bold">Kabinet Altiora</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground italic">&ldquo;Menyatukan Asa, Menggapai Altiora&rdquo;</p>
          </div>

          {/* Floating Badge Bottom Right */}
          <div className="glass absolute -bottom-3 right-0 max-w-[16rem] rounded-2xl p-4 sm:-right-4 shadow-xl border border-glass-border">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">5 Departemen Aktif</p>
            <p className="mt-1.5 font-display text-sm font-bold text-foreground">SOSGAM · MINBA · PSDM · KOMINFO · KASTRAT</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Berkolaborasi untuk mewujudkan visi kebermanfaatan KBM FKIP UIKA.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

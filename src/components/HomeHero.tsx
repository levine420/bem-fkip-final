"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, MessageSquareText, Newspaper } from "lucide-react";
import { siteConfig } from "@/config/site";

const quickIcons = [Newspaper, CalendarDays, MessageSquareText, FileText] as const;

export function HomeHero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-x-clip bg-[#0b0710] md:min-h-[88svh] md:flex md:items-center"
    >
      {/* Background foto khusus desktop */}
      <div className="absolute inset-y-0 right-0 -z-20 hidden w-[68%] md:block">
        <Image
          src="/images/kepengurusan-altiora.jpg"
          alt="Kepengurusan Kabinet Altiora BEM FKIP UIKA"
          fill
          priority
          sizes="68vw"
          className="object-cover object-center brightness-[0.58] saturate-[0.85]"
        />
      </div>

      {/* Overlay desktop */}
      <div
        className="
          pointer-events-none absolute inset-0 -z-10 hidden md:block
          bg-[linear-gradient(90deg,#0b0710_0%,#0b0710_28%,rgba(11,7,16,0.94)_45%,rgba(11,7,16,0.55)_72%,rgba(11,7,16,0.16)_100%)]
        "
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-[35%] bg-gradient-to-b from-transparent to-[#0b0710] md:block" />

      <div className="mx-auto w-full max-w-7xl">
        {/* Konten pembuka (Heading, deskripsi, dan CTA) */}
        <div className="relative z-10 px-4 pb-8 pt-28 sm:px-6 md:max-w-3xl md:pb-6 md:pt-32">
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl md:text-6xl">
            Platform Digital{" "}
            <span className="block text-pink-400">
              BEM FKIP UIKA
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            Satu pintu untuk informasi resmi, kepengurusan, program kerja, kegiatan, dokumen, dan layanan mahasiswa yang dirancang berkelanjutan lintas periode kepengurusan.
          </p>

          <div className="mt-7 flex flex-col gap-3 min-[380px]:flex-row">
            <Link
              href="/kegiatan/kalender"
              className="bg-brand focus-ring group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold text-primary-foreground transition-shadow hover:shadow-[var(--glow-pink)] sm:min-h-12 sm:px-6 sm:text-sm"
            >
              Lihat Kegiatan <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/tentang/visi-misi"
              className="glass focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-5 text-xs font-semibold hover:border-amber-400 hover:text-amber-400 sm:min-h-12 sm:px-6 sm:text-sm"
            >
              Tentang BEM
            </Link>
          </div>
        </div>

        {/* Banner foto khusus mobile */}
        <div className="relative z-0 w-full overflow-hidden bg-[#0b0710] md:hidden">
          <Image
            src="/images/kepengurusan-altiora.jpg"
            alt="Kepengurusan Kabinet Altiora BEM FKIP UIKA"
            width={1920}
            height={1080}
            priority
            sizes="100vw"
            className="h-auto w-full object-contain"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0b0710] to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-[#0b0710]/65 to-[#0b0710]" />
        </div>

        {/* Card layanan */}
        <div className="relative z-10 bg-[#0b0710] px-4 pb-14 pt-4 sm:px-6 md:bg-transparent md:max-w-2xl md:px-6 md:pb-12 md:pt-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {siteConfig.quickLinks.map((item, index) => {
              const Icon = quickIcons[index];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-[#120914]/95 backdrop-blur-md p-3.5 transition hover:border-amber-400/50 hover:bg-[#180c1b]/90 focus-ring"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-glass-border text-accent">
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block font-display text-sm font-bold text-white">{item.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

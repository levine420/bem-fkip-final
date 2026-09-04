"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, MessageSquareText, Newspaper } from "lucide-react";
import { siteConfig } from "@/config/site";

const quickIcons = [Newspaper, CalendarDays, MessageSquareText, FileText] as const;

export function HomeHero() {
  const [photoReady, setPhotoReady] = useState(true);

  return (
    <section
      id="home"
      className="relative isolate overflow-x-clip md:min-h-[88svh] md:flex md:items-center"
    >
      {/* ── Full-bleed background photo ── */}
      <div className="absolute inset-0 -z-10">
        {photoReady && (
          <Image
            src="/images/kepengurusan-altiora.jpg"
            alt="Foto Kepengurusan Kabinet Altiora BEM FKIP UIKA"
            fill
            priority
            className="object-cover object-center"
            onError={() => setPhotoReady(false)}
          />
        )}
        {/* Dark veil for contrast */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-black/40 md:bg-black/25" />

        {/* Gradient veil */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#0b0710]/95 via-[#0b0710]/75 to-[#0b0710]/45 md:from-[#0b0710]/90 md:via-[#0b0710]/55 md:to-transparent" />

        {/* Bottom fade — blends seamlessly with section below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[35%] bg-gradient-to-b from-transparent via-[#0b0710]/80 to-[#0b0710]" />

        {/* Warm amber ambient glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_60%,rgba(245,158,11,0.07),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 md:py-24">
        {/* Left Column — title, desc, CTA, quick-link cards */}
        <div className="reveal max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl xl:text-[4.4rem]">
            Platform Digital{" "}
            <span className="text-gradient block">BEM FKIP UIKA</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            Satu pintu untuk informasi resmi, kepengurusan, program kerja, kegiatan, dokumen, dan layanan mahasiswa yang dirancang berkelanjutan lintas periode kepengurusan.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
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

          <div className="mt-6 grid max-w-2xl gap-2.5 sm:grid-cols-2">
            {siteConfig.quickLinks.map((item, index) => {
              const Icon = quickIcons[index];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-glass-border bg-[#120914]/80 backdrop-blur-md p-3.5 transition hover:border-amber-400/50 hover:bg-[#180c1b]/90 focus-ring"
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

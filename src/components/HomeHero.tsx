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
    <section id="home" className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* ── Full-bleed background photo ── */}
      {/*
        FOTO KEPENGURUSAN KABINET ALTIORA
        Letakkan file foto di: /public/images/kepengurusan-altiora.jpg
        (atau .png / .webp — sesuaikan ekstensi src= di bawah)
        Ukuran yang disarankan: min 1920 × 1080 px, landscape
      */}
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
        {/* Dark veil — keeps text readable over any photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/75 to-background/40" />
        {/* Bottom fade — blends seamlessly with the section below, no visible seam */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
        {/* Warm amber ambient glow (BEM brand colour) */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_60%,rgba(245,158,11,0.07),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Left Column — title, desc, CTA, quick-link cards */}
        <div className="reveal max-w-2xl">
          <h1 className="mt-4 font-display text-[2.2rem] font-extrabold leading-[1.05] sm:text-6xl xl:text-[4.4rem]">
            Platform Digital
            <span className="text-gradient block">BEM FKIP UIKA</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            Satu pintu untuk informasi resmi, kepengurusan, program kerja, kegiatan, dokumen, dan layanan mahasiswa yang dirancang berkelanjutan lintas periode kepengurusan.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/kegiatan/kalender"
              className="bg-brand focus-ring group inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-xs font-semibold text-primary-foreground transition-shadow hover:shadow-[var(--glow-pink)] sm:min-h-12 sm:px-6 sm:text-sm"
            >
              Lihat Kegiatan <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/tentang/visi-misi"
              className="glass focus-ring inline-flex min-h-11 items-center rounded-full px-5 text-xs font-semibold hover:border-amber-400 hover:text-amber-400 sm:min-h-12 sm:px-6 sm:text-sm"
            >
              Tentang BEM
            </Link>
          </div>

          <div className="mt-6 grid max-w-2xl gap-2.5 sm:grid-cols-2">
            {siteConfig.quickLinks.map((item, index) => {
              const Icon = quickIcons[index];
              return (
                <Link key={item.href} href={item.href} className="glass glass-hover focus-ring rounded-2xl p-3.5 sm:p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-glass-border text-accent">
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block font-display text-sm font-bold">{item.title}</span>
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

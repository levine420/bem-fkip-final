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
      className="relative isolate overflow-x-clip bg-[#0b0710] lg:min-h-[88svh] lg:flex lg:items-center"
    >
      {/* Foto hanya desktop */}
      <div className="absolute inset-0 -z-20 hidden lg:block">
        <Image
          src="/images/kepengurusan-altiora.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-right brightness-[0.62] saturate-[0.85]"
        />
      </div>

      {/* Gradient kiri untuk keterbacaan teks */}
      <div
        className="
          pointer-events-none absolute inset-0 -z-10 hidden lg:block
          bg-[linear-gradient(90deg,#0b0710_0%,rgba(11,7,16,0.97)_18%,rgba(11,7,16,0.82)_36%,rgba(11,7,16,0.52)_57%,rgba(11,7,16,0.18)_78%,transparent_100%)]
        "
      />

      {/* Fade bagian bawah */}
      <div
        className="
          pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-[38%]
          bg-gradient-to-b from-transparent via-[#0b0710]/55 to-[#0b0710]
          lg:block
        "
      />

      {/* Konten */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-28 sm:px-6 sm:pb-16 lg:py-24">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-[4.4rem]">
            Platform Digital{" "}
            <span className="block text-pink-400">BEM FKIP UIKA</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
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
              className="glass focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-5 text-xs font-semibold hover:border-pink-400/60 hover:text-pink-400 sm:min-h-12 sm:px-6 sm:text-sm"
            >
              Tentang BEM
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {siteConfig.quickLinks.map((item, index) => {
              const Icon = quickIcons[index];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-[#120914]/90 backdrop-blur-md p-3.5 transition hover:border-pink-400/40 hover:bg-[#180c1b]/90 focus-ring"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/10 text-pink-400">
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block font-display text-sm font-bold text-white">{item.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-white/60">{item.description}</span>
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

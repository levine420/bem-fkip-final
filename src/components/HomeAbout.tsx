"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Building2, GraduationCap, HeartHandshake, History, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

const aboutPillars = [
  { icon: Building2, title: "Pusat Informasi", text: "Berita, pengumuman, profil organisasi, kegiatan, dan dokumen berada dalam kanal resmi yang terstruktur." },
  { icon: MessageSquareText, title: "Pusat Pelayanan", text: "Pendaftaran kegiatan dan Bank Aspirasi disiapkan sebagai layanan digital yang dapat dilacak mahasiswa." },
  { icon: ShieldCheck, title: "Transparansi", text: "Program kerja dan aktivitas organisasi dapat dipantau melalui data yang dikelola pengurus sesuai kewenangannya." },
  { icon: History, title: "Lintas Periode", text: "Kabinet lama tetap menjadi arsip read-only, sementara kabinet baru dapat diaktifkan tanpa membangun ulang website." },
] as const;

const valuePillars = [
  {
    icon: GraduationCap,
    title: "Transformasi Pedagogis",
    text: "Mempersiapkan calon guru abad 21 yang mahir mengintegrasikan pedagogi modern, teknologi pembelajaran interaktif, dan adab Islami.",
  },
  {
    icon: HeartHandshake,
    title: "Advokasi Mahasiswa Solutif",
    text: "Mengawal transparansi pembiayaan kuliah, hak fasilitas sarana microteaching, dan menjembatani dialog solutif dengan pimpinan dekanat.",
  },
  {
    icon: Sparkles,
    title: "Dedikasi Pengabdian Nyata",
    text: "Menerjunkan mahasiswa keguruan ke sekolah binaan pelosok Bogor melalui program literasi kreatif dan pendampingan calistung ramah anak.",
  },
] as const;

export function HomeAbout() {
  return (
    <>
      <section id="tentang" className="relative px-4 py-12 sm:px-6 sm:py-16 md:py-24">
        <div className="relative mx-auto max-w-7xl">
          <SectionHeading eyebrow="Tentang Platform" title="Informasi dan layanan mahasiswa dalam satu tempat" description="Kenali organisasi, ikuti kegiatan, dan akses layanan resmi BEM FKIP UIKA." action={<Link href="/tentang" className="focus-ring inline-flex min-h-11 items-center rounded-full border border-glass-border px-5 text-sm font-semibold hover:border-accent/60 hover:text-accent">Profil lengkap</Link>} />
          <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="dark-section relative rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center">
              <Image
                src="/images/logo-altiora.png"
                alt="Logo Kabinet Altiora"
                width={600}
                height={600}
                className="relative z-10 size-48 sm:size-64 object-contain "
              />
              <div className="relative z-10 mt-6 text-center">
                <p className="font-display text-lg font-bold text-foreground">Kabinet Altiora 2026–2027</p>
                <p className="text-xs text-accent font-medium italic mt-0.5">&quot;Menyatukan Asa, Menggapai Altiora&quot;</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {aboutPillars.map(({ icon: Icon, title, text }) => (
                <div key={title} className="border-b border-border py-6">
                  <span className="grid size-10 place-items-center rounded-xl border border-glass-border text-accent"><Icon className="size-5" /></span>
                  <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pilar Nilai Organisasi */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {valuePillars.map(({ icon: Icon, title, text }) => (
            <motion.div
              key={title}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="p-6 bg-white rounded-xl border border-slate-200/80 hover:border-pink-200 hover:shadow-sm transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-pink-50 text-[#E11D74] flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}


import Image from "next/image";
import Link from "next/link";
import { Building2, History, MessageSquareText, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

const pillars = [
  { icon: Building2, title: "Pusat Informasi", text: "Berita, pengumuman, profil organisasi, kegiatan, dan dokumen berada dalam kanal resmi yang terstruktur." },
  { icon: MessageSquareText, title: "Pusat Pelayanan", text: "Pendaftaran kegiatan dan Bank Aspirasi disiapkan sebagai layanan digital yang dapat dilacak mahasiswa." },
  { icon: ShieldCheck, title: "Transparansi", text: "Program kerja dan aktivitas organisasi dapat dipantau melalui data yang dikelola pengurus sesuai kewenangannya." },
  { icon: History, title: "Lintas Periode", text: "Kabinet lama tetap menjadi arsip read-only, sementara kabinet baru dapat diaktifkan tanpa membangun ulang website." },
] as const;

export function HomeAbout() {
  return (
    <section id="tentang" className="relative px-4 py-24 sm:px-6">
      <div className="orb left-[-8rem] top-10 size-[22rem] bg-primary/15" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading eyebrow="Tentang Platform" title="Bukan company profile statis, tetapi ekosistem digital mahasiswa" description="Arah produk mengikuti empat pilar: pusat informasi, pelayanan mahasiswa, transparansi organisasi, dan keberlanjutan lintas periode." action={<Link href="/tentang" className="focus-ring inline-flex min-h-11 items-center rounded-full border border-glass-border px-5 text-sm font-semibold hover:border-accent/60 hover:text-accent">Profil lengkap</Link>} />
        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-strong relative overflow-hidden rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[24rem] sm:min-h-[28rem] bg-gradient-to-b from-amber-500/10 via-transparent to-background/50 border border-amber-500/20 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent blur-2xl" />
            <Image
              src="/images/logo-altiora.png"
              alt="Logo Kabinet Altiora"
              width={600}
              height={600}
              className="relative z-10 size-48 sm:size-64 object-contain drop-shadow-[0_10px_30px_rgba(245,158,11,0.4)]"
            />
            <div className="relative z-10 mt-6 text-center">
              <p className="font-display text-lg font-bold text-foreground">Kabinet Altiora 2026–2027</p>
              <p className="text-xs text-amber-400 font-medium italic mt-0.5">"Menyatukan Asa, Menggapai Altiora"</p>
            </div>
            <div className="absolute inset-x-5 bottom-4 glass rounded-2xl p-3 text-[11px] text-center leading-relaxed text-muted-foreground">
              Foto dan profil kabinet dikelola melalui Admin Panel dan secara otomatis memperbarui tampilan publik.
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass rounded-3xl p-6">
                <span className="grid size-10 place-items-center rounded-xl border border-glass-border text-accent"><Icon className="size-5" /></span>
                <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

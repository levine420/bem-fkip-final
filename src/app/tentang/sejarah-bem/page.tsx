import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { BookOpen, Flag, Shield, Sparkles } from "lucide-react";

export default function HistoryPage() {
  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Tentang BEM"
        title="Sejarah Singkat BEM FKIP UIKA Bogor"
        description="Jejak sejarah pendirian, nilai perjuangan, dan transformasi kepemimpinan mahasiswa Fakultas Keguruan dan Ilmu Pendidikan Universitas Ibn Khaldun Bogor."
        breadcrumbs={[{ label: "Tentang", href: "/tentang" }, { label: "Sejarah BEM" }]}
      />

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="glass rounded-3xl p-6 sm:p-8 border-accent/30 space-y-4">
            <div className="flex items-center gap-3 text-accent font-semibold text-sm">
              <Flag className="size-5" /> Identitas & Landasan Kelembagaan
            </div>
            <h3 className="text-2xl font-bold text-white">Perjalanan Kelembagaan Mahasiswa</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Badan Eksekutif Mahasiswa Fakultas Keguruan dan Ilmu Pendidikan (BEM FKIP) Universitas Ibn Khaldun Bogor didirikan sebagai lembaga eksekutif tertinggi mahasiswa di tingkat fakultas. Berdiri di atas asas keislaman, keilmuan, dan pengabdian, BEM FKIP UIKA bertindak sebagai wadah pergerakan, advokasi hak mahasiswa, serta pengembangan kompetensi calon pendidik yang profesional dan berakhlakul karimah.
            </p>
          </div>

          <div className="glass rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="size-5 text-accent" /> Garis Waktu Transformasi Kabinet
            </h3>

            <div className="space-y-6 border-l-2 border-accent/40 pl-6">
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-accent border-4 border-background" />
                <span className="text-xs font-semibold text-accent uppercase">Periode 2024 – 2025</span>
                <h4 className="text-base font-semibold text-white mt-1">Kabinet Bakti Nusantara</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Fokus utama pada digitalisasi tata kelola organisasi, integrasi layanan aspirasi online, dan penguatan riset pendidikan berbasis teknologi.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-gray-500 border-4 border-background" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Periode 2023 – 2024</span>
                <h4 className="text-base font-semibold text-white mt-1">Kabinet Sinergi Perjuangan</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Fokus pada advokasi kesejahteraan mahasiswa, pengawalan keringanan UKT, dan konsolidasi ORMAWA antar-prodi FKIP.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-gray-500 border-4 border-background" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Periode 2022 – 2023</span>
                <h4 className="text-base font-semibold text-white mt-1">Kabinet Aksara Reformasi</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Peningkatan budaya literasi, pergerakan sosial kemasyarakatan, dan tanggap bencana di wilayah Kabupaten Bogor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageFrame>
  );
}

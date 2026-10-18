import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { Flag, Sparkles } from "lucide-react";

export default function HistoryPage() {
  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Tentang BEM"
        title="Sejarah Singkat BEM FKIP UIKA Bogor"
        description="Jejak sejarah pendirian, nilai perjuangan, dan transformasi kepemimpinan mahasiswa Fakultas Keguruan dan Ilmu Pendidikan."
        breadcrumbs={[{ label: "Tentang", href: "/tentang" }, { label: "Sejarah BEM" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Identitas kelembagaan */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 hover:border-pink-200 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-[#BE185D] uppercase tracking-wider">
            <Flag className="w-4 h-4" /> Identitas & Landasan Kelembagaan
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Perjalanan Kelembagaan Mahasiswa</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Badan Eksekutif Mahasiswa Fakultas Keguruan dan Ilmu Pendidikan (BEM FKIP) Universitas Ibn Khaldun Bogor
            didirikan sebagai lembaga eksekutif tertinggi mahasiswa di tingkat fakultas. Berdiri di atas asas keislaman,
            keilmuan, dan pengabdian, BEM FKIP UIKA bertindak sebagai wadah pergerakan, advokasi hak mahasiswa,
            serta pengembangan kompetensi calon pendidik yang profesional dan berakhlakul karimah.
          </p>
        </div>

        {/* Timeline kabinet */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E11D74]" /> Garis Waktu Transformasi Kabinet
          </h3>
          <div className="space-y-6 border-l-2 border-pink-200 pl-6">
            {[
              {
                period: "Periode 2024 – 2025",
                name: "Kabinet Bakti Nusantara",
                desc: "Fokus utama pada digitalisasi tata kelola organisasi, integrasi layanan aspirasi online, dan penguatan riset pendidikan berbasis teknologi.",
                active: true,
              },
              {
                period: "Periode 2023 – 2024",
                name: "Kabinet Sinergi Perjuangan",
                desc: "Fokus pada advokasi kesejahteraan mahasiswa, pengawalan keringanan UKT, dan konsolidasi ORMAWA antar-prodi FKIP.",
                active: false,
              },
              {
                period: "Periode 2022 – 2023",
                name: "Kabinet Aksara Reformasi",
                desc: "Peningkatan budaya literasi, pergerakan sosial kemasyarakatan, dan tanggap bencana di wilayah Kabupaten Bogor.",
                active: false,
              },
            ].map((item) => (
              <div key={item.period} className="relative">
                <div className={`absolute -left-[31px] top-1.5 size-3 rounded-full border-4 border-white ${item.active ? "bg-[#E11D74]" : "bg-slate-300"}`} />
                <span className={`text-xs font-semibold uppercase ${item.active ? "text-[#BE185D]" : "text-slate-400"}`}>{item.period}</span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicPageFrame>
  );
}

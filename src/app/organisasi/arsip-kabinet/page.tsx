import { Archive } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

const archiveCabinets = [
  {
    id: "kab-2023",
    name: "Kabinet Sinergi Perjuangan (2023–2024)",
    ketua: "Fikri Ardiansyah",
    wakil: "Nabila Putri",
    visi: "Mewujudkan BEM FKIP UIKA yang progresif, inklusif, dan tanggap terhadap isu advokasi mahasiswa.",
    achievements: ["Pengawalan 120+ kuota Keringanan UKT", "Penyelenggaraan FKIP Expo 2023", "Bina Desa Edukasi 2.0"],
  },
  {
    id: "kab-2022",
    name: "Kabinet Aksara Reformasi (2022–2023)",
    ketua: "Rian Hidayatullah",
    wakil: "Syafa Amalia",
    visi: "Membangun iklim ilmiah, budaya literasi, dan sinergi gerakan mahasiswa FKIP yang berdaya saing.",
    achievements: ["Rilis 5 Naskah Kajian Kritis Pendidikan", "Tanggap Bencana Gempa Cianjur", "LKMM-TD Terpadu"],
  },
];

export default function CabinetArchivePage() {
  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Arsip Kepengurusan"
        title="Arsip Kabinet BEM FKIP UIKA"
        description="Dokumentasi kepengurusan periode terdahulu tetap disajikan dalam mode read-only untuk kesinambungan sejarah organisasi."
        breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Arsip Kabinet" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid gap-6 sm:grid-cols-2">
          {archiveCabinets.map((kab) => (
            <div key={kab.id} className="bg-white rounded-xl border border-slate-200/90 hover:border-pink-300 transition-all duration-200 p-6 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 text-xs font-semibold">
                  <Archive className="w-3.5 h-3.5" /> Arsip Read-Only
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{kab.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Presidium: <strong className="text-slate-700">{kab.ketua}</strong> & <strong className="text-slate-700">{kab.wakil}</strong>
                </p>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed italic">"{kab.visi}"</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 text-xs">
                <p className="font-semibold text-[#BE185D] mb-2">Capaian Utama:</p>
                {kab.achievements.map((ach, idx) => (
                  <p key={idx} className="text-slate-500 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#E11D74] shrink-0" /> {ach}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicPageFrame>
  );
}

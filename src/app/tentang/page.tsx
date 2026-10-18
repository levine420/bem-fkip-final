import Link from "next/link";
import { CheckCircle2, Compass, Users, ChevronDown, History, Network, Landmark } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { EmptyState } from "@/components/EmptyState";
import { getActivePeriod, getActiveBoardMembers } from "@/server/public/data";

export const revalidate = 60;

const faqs = [
  {
    q: "Bagaimana cara bergabung menjadi fungsionaris BEM FKIP UIKA?",
    a: "Perekrutan fungsionaris dibuka setiap awal tahun ajaran baru (Open Recruitment) melalui seleksi berkas administrasi dan wawancara komitmen. Mahasiswa aktif semester 3 dan 5 berhak mendaftar.",
  },
  {
    q: "Apakah mahasiswa umum dapat mengajukan bantuan advokasi masalah UKT atau akademik?",
    a: "Tentu saja! Departemen Advokesma membuka kanal advokasi melalui fitur 'Suara FKIP' di website ini atau dapat langsung mendatangi Sekretariat BEM FKIP.",
  },
  {
    q: "Bagaimana cara mendaftar kegiatan pengabdian masyarakat BEM FKIP?",
    a: "Setiap agenda pengabdian selalu membuka pendaftaran relawan terbuka melalui formulir online pada menu Kegiatan.",
  },
];

const misi = [
  "Membangun internal organisasi yang solid, profesional, dan berlandaskan nilai-nilai ukhuwah Islamiyah.",
  "Mengoptimalkan sistem advokasi mahasiswa yang responsif, transparan, dan berorientasi pada penyelesaian masalah nyata.",
  "Mengembangkan iklim keilmiahan, riset pedagogik, dan literasi teknologi bagi calon guru masa depan.",
  "Menyelenggarakan program pengabdian masyarakat berkelanjutan berbasis pendidikan karakter di wilayah Bogor.",
  "Menjalin sinergi kemitraan strategis dengan ormawa internal UIKA, alumni, dan lembaga kepemudaan.",
];

export default async function AboutPage() {
  const activePeriod = await getActivePeriod();

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Profil Kabinet"
        title={`Kabinet ${activePeriod?.name ?? "BEM FKIP UIKA"}`}
        description="Badan Eksekutif Mahasiswa Fakultas Keguruan dan Ilmu Pendidikan Universitas Ibn Khaldun Bogor — lembaga eksekutif tertinggi di tingkat fakultas yang menaungi aspirasi dan gerakan mahasiswa keguruan."
        breadcrumbs={[{ label: "Tentang" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">

        {/* Visi & Misi */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Visi — dark card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-pink-950 via-slate-900 to-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-300">
                <Compass className="w-4 h-4" />
                <span>Arah Gerak Utama</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Visi BEM FKIP UIKA</h2>
              <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed">
                {activePeriod?.visi ?? "\"Mewujudkan BEM FKIP UIKA Bogor sebagai wadah kolaboratif yang harmonis, solutif, dan berintegritas tinggi dalam melahirkan insan pendidik yang berakhlak mulia, berpikiran kritis, serta berdaya saing global.\""}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 text-xs text-slate-300">
              Nilai Inti: <strong className="text-pink-300">Integritas • Empati • Dedikasi • Transformatif</strong>
            </div>
          </div>

          {/* Misi — white card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 sm:p-10 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Misi Strategis</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Misi Kepengurusan</h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              {(activePeriod?.misi ? activePeriod.misi.split("\n").filter(Boolean) : misi).map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#E11D74] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed">{m}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigasi halaman terkait */}
        <section>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D] mb-5">
            <Users className="w-4 h-4" />
            <span>Jelajahi Lebih Lanjut</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: History, title: "Sejarah BEM", text: "Riwayat singkat BEM FKIP UIKA dan kedudukannya di lingkungan fakultas.", href: "/tentang/sejarah-bem" },
              { icon: Network, title: "Struktur Kepengurusan", text: "Jajaran inti, departemen, dan pengurus periode aktif.", href: "/organisasi/struktur-kepengurusan" },
              { icon: Landmark, title: "Arsip Kabinet", text: "Periode sebelumnya tetap dapat diakses dalam mode read-only.", href: "/organisasi/arsip-kabinet" },
            ].map(({ icon: Icon, title, text, href }) => (
              <Link key={href} href={href}
                className="group p-5 bg-white rounded-xl border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-50 text-[#E11D74] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#E11D74] transition-colors">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#E11D74] font-semibold">
                  Selengkapnya →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 rounded-2xl p-6 sm:p-10 border border-slate-200/80 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Pertanyaan yang Sering Diajukan</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Informasi praktis seputar keorganisasian dan cara bergabung dalam kegiatan BEM FKIP UIKA.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <details key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-bold text-slate-900 hover:text-[#BE185D] transition-colors cursor-pointer list-none">
                  <span>{item.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </PublicPageFrame>
  );
}

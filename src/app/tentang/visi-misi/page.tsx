import Image from "next/image";
import Link from "next/link";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { activePeriod } from "@/lib/data/public-data";
import { Star, Compass, Target, Lightbulb, Eye, BookOpen, ArrowRight } from "lucide-react";

const misiList = [
  "Mewujudkan tata kelola organisasi yang transparan, akuntabel dan profesional.",
  "Menguatkan kolaborasi dan sinergi antar mahasiswa.",
  "Menghadirkan program kerja yang inovatif dan relevan sesuai dengan kebutuhan mahasiswa.",
  "Membangun organisasi yang adaptif terhadap perkembangan dan tantangan zaman.",
  "Memberikan pelayanan, pengembangan dan kebermanfaatan yang nyata bagi KBM FKIP UIKA.",
];

const nilaiAltiora = [
  { huruf: "A", nilai: "Adaptif", makna: "Mampu menyesuaikan diri dengan perubahan zaman, teknologi, dan kebutuhan mahasiswa.", color: "from-amber-500 to-yellow-400" },
  { huruf: "L", nilai: "Leadership", makna: "Menumbuhkan kepemimpinan yang melayani, menginspirasi, dan memberikan teladan.", color: "from-yellow-500 to-amber-400" },
  { huruf: "T", nilai: "Transparatif", makna: "Menjalankan organisasi secara terbuka, akuntabel, dan dapat dipertanggungjawabkan.", color: "from-amber-600 to-yellow-500" },
  { huruf: "I", nilai: "Inovatif", makna: "Menghadirkan gagasan, program, dan solusi yang kreatif serta berdampak.", color: "from-yellow-600 to-amber-500" },
  { huruf: "O", nilai: "Objektif", makna: "Mengambil keputusan berdasarkan kebutuhan, data, dan kepentingan bersama.", color: "from-amber-500 to-yellow-400" },
  { huruf: "R", nilai: "Responsif", makna: "Cepat tanggap terhadap aspirasi, tantangan, dan dinamika mahasiswa.", color: "from-yellow-500 to-amber-400" },
  { huruf: "A", nilai: "Amanah", makna: "Menjaga kepercayaan dalam menjalankan tanggung jawab dengan profesional dan integritas.", color: "from-amber-600 to-yellow-500" },
];

const prinsipKerja = [
  "Berjuang dengan Dedikasi",
  "Mengabdi dengan Ketulusan",
  "Bergerak dengan Strategi",
  "Menyelesaikan dengan Totalitas",
];

const filosofiLogo = [
  { simbol: "Huruf A", ikon: "🔺", makna: "Melambangkan identitas utama Altiora sekaligus simbol kemajuan dan semangat untuk terus bertumbuh menuju pencapaian yang lebih tinggi." },
  { simbol: "Bintang di Tengah", ikon: "⭐", makna: "Melambangkan visi bersama, harapan, serta kebermanfaatan yang menjadi pusat orientasi seluruh gerakan organisasi." },
  { simbol: "Empat Mata Angin", ikon: "🧭", makna: "Melambangkan nilai utama kabinet Altiora: Kolaboratif, Inovatif, Transparatif, dan Adaptif." },
  { simbol: "Lingkaran Kompas", ikon: "⭕", makna: "Melambangkan persatuan, kesinambungan, dan sinergi seluruh elemen organisasi dalam mencapai tujuan bersama." },
];

export default function VisionMissionPage() {
  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow={`Kabinet Aktif · ${activePeriod.year_start}–${activePeriod.year_end}`}
        title="Visi & Misi Kabinet Altiora"
        description='"Menyatukan Asa, Menggapai Altiora"'
        breadcrumbs={[{ label: "Tentang", href: "/tentang" }, { label: "Visi & Misi" }]}
      />

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-10 sm:space-y-12">

          {/* Logo + Nama Kabinet */}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative size-40 drop-shadow-2xl">
              <Image
                src="/images/logo-altiora.png"
                alt="Logo Kabinet Altiora BEM FKIP UIKA"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">Kabinet Aktif 2026–2027</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                KABINET <span className="text-gradient-gold">ALTIORA</span>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground italic">
                Dari bahasa Latin <em>Altior</em> — "lebih tinggi", "lebih baik", "terus bertumbuh menuju tingkat yang lebih unggul."
              </p>
            </div>
          </div>

          {/* Visi */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Eye className="size-5" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Visi</h3>
            </div>
            <div className="glass rounded-3xl border-amber-500/20 p-8 shadow-xl">
              <p className="text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
                &ldquo;{activePeriod.visi}&rdquo;
              </p>
            </div>
          </div>

          {/* Misi */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Target className="size-5" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Misi</h3>
            </div>
            <div className="grid gap-3">
              {misiList.map((misi, i) => (
                <div key={i} className="glass flex items-start gap-5 rounded-2xl p-5 shadow-md transition hover:border-amber-500/30">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 font-display text-sm font-black text-black shadow">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed text-foreground/90">{misi}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Makna Nama Kabinet */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <BookOpen className="size-5" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Makna Nama Kabinet</h3>
            </div>
            <div className="glass rounded-3xl p-8 shadow-xl space-y-4">
              <p className="text-base leading-relaxed text-foreground/90">
                <strong className="text-amber-400">ALTIORA</strong> berasal dari bahasa Latin <em>Altior</em> yang berarti{" "}
                <strong>"lebih tinggi"</strong>, <strong>"lebih baik"</strong>, atau{" "}
                <strong>"terus bertumbuh menuju tingkat yang lebih unggul."</strong> Nama ini merepresentasikan semangat untuk
                senantiasa berkembang, melampaui batas, serta menghadirkan perubahan yang progresif dan berdampak.
              </p>
              <p className="text-base leading-relaxed text-foreground/90">
                ALTIORA menjadi simbol perjalanan bersama untuk membawa organisasi menuju standar yang lebih tinggi dalam
                pengabdian, kepemimpinan, inovasi, dan kebermanfaatan bagi mahasiswa.
              </p>
            </div>
          </div>

          {/* Filosofi Logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Compass className="size-5" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Filosofi Logo</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {filosofiLogo.map((item) => (
                <div key={item.simbol} className="glass rounded-2xl p-5 shadow-md transition hover:border-amber-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{item.ikon}</span>
                    <span className="font-bold text-amber-400 text-sm">{item.simbol}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.makna}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nilai Organisasi ALTIORA */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Star className="size-5" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Nilai Organisasi</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Nilai Organisasi Kabinet ALTIORA dirangkai dari akronim nama kabinet sebagai nilai perilaku yang diharapkan melekat pada setiap pengurus.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {nilaiAltiora.map((item) => (
                <div key={item.nilai} className="glass group rounded-2xl p-5 shadow-md transition hover:border-amber-500/30">
                  <div className="mb-3 flex items-center gap-3">
                    <span className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${item.color} font-display text-xl font-black text-black shadow`}>
                      {item.huruf}
                    </span>
                    <span className="font-bold text-foreground">{item.nilai}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.makna}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prinsip Kerja */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Lightbulb className="size-5" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Prinsip Kerja</h3>
            </div>
            <div className="glass rounded-3xl p-8 shadow-xl">
              <div className="grid gap-4 sm:grid-cols-2">
                {prinsipKerja.map((prinsip, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-400 font-display text-xs font-black text-black shadow">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-semibold text-foreground text-sm">{prinsip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 text-center pt-4">
            <p className="text-sm text-muted-foreground">Pelajari lebih lanjut tentang struktur dan program kerja Kabinet Altiora</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/organisasi/struktur-kepengurusan" className="bg-brand focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:shadow-md transition">
                Struktur Kepengurusan <ArrowRight className="size-4" />
              </Link>
              <Link href="/organisasi/departemen" className="glass focus-ring inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold hover:border-accent/50 transition">
                Lihat Departemen
              </Link>
            </div>
          </div>

        </div>
      </section>
    </PublicPageFrame>
  );
}

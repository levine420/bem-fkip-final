import { PublicListing } from "@/components/PublicListing";

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
    <PublicListing
      eyebrow="Organisasi"
      title="Arsip Kepengurusan Kabinet"
      description="Dokumentasi kepengurusan periode terdahulu tetap disajikan dalam mode read-only untuk kesinambungan sejarah organisasi BEM FKIP UIKA."
      breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Arsip Kabinet" }]}
      toolbar={[
        { label: "Semua Arsip", href: "/organisasi/arsip-kabinet" },
        { label: "Mode Read-Only", href: "/organisasi/arsip-kabinet" },
      ]}
      emptyTitle="Belum ada periode arsip"
      emptyDescription="Ketika periode aktif diganti, periode lama berstatus Arsip dan tampil di halaman ini."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {archiveCabinets.map((kab) => (
          <div key={kab.id} className="glass rounded-3xl p-6 transition duration-300 hover:border-accent/50 flex flex-col justify-between">
            <div>
              <span className="rounded-full bg-accent/20 text-accent font-semibold px-3 py-1 text-xs">
                Arsip Read-Only
              </span>
              <h3 className="mt-3 text-xl font-bold text-white">{kab.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Presidium: <strong className="text-white">{kab.ketua}</strong> & <strong className="text-white">{kab.wakil}</strong>
              </p>
              <p className="mt-3 text-sm text-soft leading-relaxed">
                "{kab.visi}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-glass-border space-y-1.5 text-xs">
              <p className="font-semibold text-accent mb-1">Capaian Utama:</p>
              {kab.achievements.map((ach, idx) => (
                <p key={idx} className="text-muted-foreground flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-accent" /> {ach}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PublicListing>
  );
}

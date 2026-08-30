import Image from "next/image";
import Link from "next/link";
import { Mail, Instagram, FileText, Calendar, ChevronRight, Users, Target } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

// Dummy data - will be replaced with real data from database
const dummyDepartment = {
  id: "d-kominfo",
  name: "Komunikasi dan Informasi (KOMINFO)",
  abbreviation: "KOMINFO",
  color: "from-pink-500 to-rose-400",
  description: "Bertanggung jawab atas pengelolaan informasi dan publikasi seluruh kegiatan BEM FKIP UIKA. Mengelola media sosial resmi, membuat konten kreatif, mendokumentasikan kegiatan, dan membangun citra positif organisasi di ruang digital.",
  vision: "Menjadi pusat informasi dan komunikasi yang kredibel, inovatif, dan responsif bagi seluruh Keluarga Besar Mahasiswa FKIP UIKA.",
  mission: [
    "Mengelola platform digital dan media sosial BEM FKIP UIKA secara profesional",
    "Memproduksi konten berkualitas yang informatif, edukatif, dan engaging",
    "Mendokumentasikan seluruh kegiatan organisasi dengan baik",
    "Membangun branding dan citra positif BEM FKIP UIKA di mata publik"
  ]
};

const dummyHead = {
  name: "Rizki Pratama",
  position: "Kepala Departemen KOMINFO",
  photo: "/images/placeholder-profile.jpg", // Will use initials if no photo
  email: "kominfo@bemfkip-uika.ac.id",
  instagram: "@kominfo.bemfkip",
  bio: "Mahasiswa Pendidikan Bahasa Inggris semester 6 yang passionate di bidang desain grafis, konten kreator, dan manajemen media sosial. Berpengalaman dalam mengelola berbagai project publikasi kampus."
};

const dummyStaff = [
  { name: "Siti Nurhaliza", role: "Koordinator Konten", photo: null },
  { name: "Ahmad Fauzi", role: "Desainer Grafis", photo: null },
  { name: "Dea Ananda", role: "Videographer", photo: null },
  { name: "Budi Santoso", role: "Social Media Specialist", photo: null },
  { name: "Rina Safitri", role: "Photographer", photo: null },
  { name: "Eko Prasetyo", role: "Content Writer", photo: null }
];

const dummyPrograms = [
  {
    title: "Rebranding Media Sosial BEM",
    description: "Pembaruan visual identity dan content strategy untuk semua platform media sosial resmi BEM FKIP UIKA",
    status: "Sedang Berjalan",
    progress: 65
  },
  {
    title: "Podcast BEM FKIP",
    description: "Produksi podcast mingguan yang membahas isu kampus, tips mahasiswa, dan wawancara tokoh inspiratif",
    status: "Perencanaan",
    progress: 25
  },
  {
    title: "Workshop Konten Kreator",
    description: "Pelatihan pembuatan konten digital untuk anggota BEM dan mahasiswa umum",
    status: "Terlaksana",
    progress: 100
  }
];

const dummyPublications = [
  { title: "Pelantikan Kabinet Altiora 2026-2027", category: "BERITA", date: "2026-08-15" },
  { title: "Tips Produktif di Masa Perkuliahan", category: "ARTIKEL", date: "2026-08-10" },
  { title: "Dokumentasi LKMM BEM FKIP", category: "GALERI", date: "2026-08-05" }
];

export default async function DepartmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // In real implementation, fetch data based on slug
  // const department = await getDepartmentBySlug(slug);
  
  return (
    <PublicPageFrame>
      <PublicPageHero 
        eyebrow="Departemen · Kabinet Altiora 2026-2027"
        title={dummyDepartment.name}
        description={dummyDepartment.description}
        breadcrumbs={[
          { label: "Organisasi", href: "/organisasi" }, 
          { label: "Departemen", href: "/organisasi/departemen" }, 
          { label: dummyDepartment.abbreviation }
        ]}
      />

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-12">
          
          {/* Vision & Mission */}
          <div className="glass rounded-3xl p-8 space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Visi Departemen</h2>
              <p className="text-base text-foreground leading-relaxed">{dummyDepartment.vision}</p>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Misi Departemen</h2>
              <ul className="space-y-2">
                {dummyDepartment.mission.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-accent mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Department Head Spotlight */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <Users className="size-5 text-accent" />
              Kepala Departemen
            </h2>
            <div className="glass rounded-3xl p-8">
              <div className="flex flex-col gap-8 md:flex-row md:items-start">
                {/* Photo */}
                <div className="shrink-0">
                  {dummyHead.photo ? (
                    <div className="relative size-32 overflow-hidden rounded-2xl border-4 border-accent/30">
                      <Image src={dummyHead.photo} alt={dummyHead.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className={`flex size-32 items-center justify-center rounded-2xl bg-gradient-to-br ${dummyDepartment.color} text-4xl font-black text-black shadow-lg`}>
                      {dummyHead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{dummyHead.name}</h3>
                    <p className="text-sm text-accent">{dummyHead.position}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{dummyHead.bio}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <a href={`mailto:${dummyHead.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-accent transition">
                      <Mail className="size-4" /> {dummyHead.email}
                    </a>
                    <a href={`https://instagram.com/${dummyHead.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition">
                      <Instagram className="size-4" /> {dummyHead.instagram}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Grid */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <Users className="size-5 text-accent" />
              Anggota Staff
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dummyStaff.map((staff, i) => (
                <div key={i} className="glass rounded-2xl p-6 flex items-center gap-4">
                  {staff.photo ? (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-glass-border">
                      <Image src={staff.photo} alt={staff.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className={`flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${dummyDepartment.color} text-lg font-bold text-black`}>
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Foto dan data staff dapat diperbarui melalui Admin Panel oleh Super Admin atau Kepala Departemen.
            </p>
          </div>

          {/* Work Programs */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <Target className="size-5 text-accent" />
              Program Kerja
            </h2>
            <div className="space-y-4">
              {dummyPrograms.map((program, i) => (
                <div key={i} className="glass rounded-2xl p-6">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{program.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{program.description}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      program.status === "Terlaksana" ? "bg-green-500/20 text-green-400" :
                      program.status === "Sedang Berjalan" ? "bg-blue-500/20 text-blue-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}>
                      {program.status}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-accent">{program.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${dummyDepartment.color} transition-all duration-500`}
                        style={{ width: `${program.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/organisasi/program-kerja" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
              Lihat Semua Program Kerja <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Recent Publications */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <FileText className="size-5 text-accent" />
              Publikasi Terkait
            </h2>
            <div className="space-y-3">
              {dummyPublications.map((pub, i) => (
                <Link key={i} href={`/berita/${pub.title.toLowerCase().replace(/ /g, '-')}`} className="glass flex items-center justify-between rounded-2xl p-5 transition hover:border-accent/40">
                  <div className="flex items-center gap-4">
                    <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      pub.category === "BERITA" ? "bg-blue-500/20 text-blue-400" :
                      pub.category === "ARTIKEL" ? "bg-purple-500/20 text-purple-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}>
                      {pub.category}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{pub.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" /> {pub.date}
                    </span>
                    <ChevronRight className="size-4" />
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/berita" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
              Lihat Semua Publikasi <ChevronRight className="size-4" />
            </Link>
          </div>

        </div>
      </section>
    </PublicPageFrame>
  );
}

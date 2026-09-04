"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, FileText, MapPin, Tag, Users } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { departments, events, publicDocuments, publishedContents, workPrograms } from "@/lib/data/public-data";

const deptGradients = [
  "from-pink-600/30 to-purple-600/10",
  "from-blue-600/30 to-cyan-600/10",
  "from-green-600/30 to-emerald-600/10",
  "from-orange-600/30 to-yellow-600/10",
  "from-red-600/30 to-pink-600/10",
  "from-violet-600/30 to-indigo-600/10",
];
const deptAccents = ["text-pink-400", "text-blue-400", "text-green-400", "text-orange-400", "text-red-400", "text-violet-400"];

export function HomeDepartments() {
  return (
    <section id="departemen" className="relative px-4 py-24 sm:px-6">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Departemen"
          title="Struktur bidang kerja pada periode aktif"
          description="Setiap departemen memiliki profil, pengurus, program kerja, dan publikasi terkait."
          action={
            <Link href="/organisasi/departemen" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-glass-border px-5 text-sm font-semibold hover:border-accent/60 hover:text-accent">
              Semua departemen <ArrowUpRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept, i) => (
            <Link
              key={dept.id}
              href={`/organisasi/departemen/${dept.id}`}
              className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col group"
            >
              {/* Decorative gradient top strip */}
              <div className={`h-2 w-full bg-gradient-to-r ${deptGradients[i % deptGradients.length]}`} />
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className={`size-14 rounded-2xl bg-gradient-to-br ${deptGradients[i % deptGradients.length]} border border-white/10 flex items-center justify-center mb-4 font-black text-2xl ${deptAccents[i % deptAccents.length]} transition-transform group-hover:scale-110`}>
                    {dept.name.slice(0, 1).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{dept.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{dept.description}</p>
                </div>
                <div className={`mt-6 border-t border-glass-border pt-4 flex justify-between items-center text-xs ${deptAccents[i % deptAccents.length]} transition-transform group-hover:translate-x-1`}>
                  <span>Lihat Profil Departemen</span>
                  <ArrowUpRight className="size-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const prokerImages: Record<string, string> = {
  "wp-psdm-1": "/images/event-seminar.png",
  "wp-psdm-2": "/images/news-advocacy.png",
  "wp-psdm-3": "/images/news-platform.png",
  "wp-minba-1": "/images/event-sports.png",
  "wp-minba-2": "/images/hero-banner.png",
  "wp-minba-3": "/images/event-sports.png",
  "wp-kastrat-1": "/images/event-seminar.png",
  "wp-sosgam-1": "/images/news-advocacy.png",
  "wp-kominfo-1": "/images/news-platform.png",
};

export function HomePrograms() {
  const featuredPrograms = workPrograms.slice(0, 6);

  return (
    <section id="program-kerja" className="relative px-4 py-24 sm:px-6">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Program Kerja"
          title="Transparansi pelaksanaan program kerja"
          description="Program kerja dikelompokkan per departemen dan periode, dengan status yang diperbarui oleh pengurus."
          action={
            <Link href="/organisasi/program-kerja" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-glass-border px-5 text-sm font-semibold hover:border-accent/60 hover:text-accent">
              Lihat program kerja <ArrowUpRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPrograms.map((proker) => (
            <div key={proker.id} className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col justify-between">
              <div>
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={prokerImages[proker.id] || "/images/hero-banner.png"}
                    alt={proker.name}
                    fill
                    className="object-cover brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <span
                    className={`absolute top-3 right-3 inline-block rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                      proker.status === "SELESAI"
                        ? "bg-green-500/40 text-green-200"
                        : proker.status === "BERJALAN"
                        ? "bg-yellow-500/40 text-yellow-200"
                        : "bg-blue-500/40 text-blue-200"
                    }`}
                  >
                    {proker.status === "SELESAI" ? "Selesai" : proker.status === "BERJALAN" ? "Sedang Berjalan" : "Belum Mulai"}
                  </span>
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {departments.find((d) => d.id === proker.department_id)?.name || "Unggulan BEM"}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-white">{proker.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{proker.description}</p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-0 text-xs text-muted-foreground">
                <span className="text-white font-medium">Target:</span> {proker.target_waktu}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeEvents() {
  return (
    <section id="kegiatan" className="relative px-4 py-24 sm:px-6">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Kegiatan"
          title="Agenda BEM dan pendaftaran kegiatan"
          description="Kegiatan publik memiliki detail waktu, lokasi, penyelenggara, status pendaftaran, dan kuota jika berlaku."
          action={
            <Link href="/kegiatan/kalender" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-glass-border px-5 text-sm font-semibold hover:border-accent/60 hover:text-accent">
              Kalender kegiatan <ArrowUpRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {events.map((ev) => (
            <div key={ev.id} className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col">
              {/* Event Cover Image */}
              {ev.poster_url && (
                <div className="relative h-52 w-full overflow-hidden">
                  <Image src={ev.poster_url} alt={ev.name} fill className="object-cover brightness-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                    ev.registration_status === "TERBUKA" ? "bg-green-500/50 text-green-100" : "bg-yellow-500/50 text-yellow-100"
                  }`}>
                    {ev.registration_status === "TERBUKA" ? "Pendaftaran Terbuka" : "Segera Dibuka"}
                  </span>
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-semibold text-white/90">
                    <Calendar className="size-3.5" />
                    {new Date(ev.start_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{ev.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{ev.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-glass-border flex flex-wrap items-center justify-between gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-4 text-accent" /> {ev.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4 text-accent" /> Kuota: {ev.max_participants ?? "∞"}
                  </span>
                  <Link href={`/kegiatan/${ev.id}/daftar`} className="focus-ring rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover">
                    Daftar Sekarang
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeNews() {
  return (
    <section id="berita" className="relative px-4 py-24 sm:px-6">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Berita & Pengumuman"
          title="Kanal publikasi resmi BEM FKIP UIKA"
          description="Konten publikasi resmi yang diterbitkan oleh tim pengurus BEM FKIP UIKA."
          action={
            <Link href="/berita" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-glass-border px-5 text-sm font-semibold hover:border-accent/60 hover:text-accent">
              Semua berita <ArrowUpRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {publishedContents.map((news) => (
            <Link key={news.id} href={`/berita/${news.slug}`} className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col">
              {/* Thumbnail */}
              {news.thumbnail_url ? (
                <div className="relative h-44 w-full overflow-hidden">
                  <Image src={news.thumbnail_url} alt={news.title} fill className="object-cover brightness-75 transition duration-500 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-3 left-4 rounded-full bg-accent/90 text-white text-[10px] font-bold px-2.5 py-0.5">
                    {news.category}
                  </span>
                </div>
              ) : (
                <div className="h-44 w-full bg-gradient-to-br from-accent/20 to-brand/10 flex items-center justify-center">
                  <Tag className="size-10 text-accent/40" />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white line-clamp-2 leading-snug">{news.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{news.excerpt}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-glass-border flex justify-between items-center text-xs text-muted-foreground">
                  <span>{new Date(news.published_at!).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="text-accent flex items-center gap-1 font-medium">{news.reading_time} min <ArrowUpRight className="size-3" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeDocuments() {
  return (
    <section id="dokumen" className="relative px-4 py-24 sm:px-6">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Dokumen"
          title="Arsip publik organisasi yang terstruktur"
          description="Dokumen resmi organisasi BEM FKIP UIKA (AD/ART, SK, LPJ, dan Proposal) yang dapat diunduh publik."
          action={
            <Link href="/dokumen" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-glass-border px-5 text-sm font-semibold hover:border-accent/60 hover:text-accent">
              Semua dokumen <ArrowUpRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {publicDocuments.map((doc) => (
            <div key={doc.id} className="glass rounded-3xl p-5 transition duration-300 hover:border-accent/50 flex flex-col justify-between">
              {/* PDF Icon Banner */}
              <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center mb-4 border border-white/5">
                <FileText className="size-12 text-red-400/60" />
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-500/30 text-red-300 rounded-md px-1.5 py-0.5">PDF</span>
                <div className="absolute bottom-2 left-3 text-[10px] font-semibold text-accent uppercase tracking-wider">{doc.category}</div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white line-clamp-2">{doc.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{doc.original_filename}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-glass-border flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <button
                  onClick={() => alert(`Mengunduh dokumen: ${doc.original_filename}`)}
                  className="focus-ring rounded-lg border border-glass-border px-3 py-1 text-xs font-medium hover:border-accent hover:text-accent"
                >
                  Unduh File
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

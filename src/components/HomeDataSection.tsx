"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, FileText, MapPin, Users } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { EmptyState } from "@/components/EmptyState";

const deptGradients = [
  "from-pink-600/30 to-purple-600/10",
  "from-blue-600/30 to-cyan-600/10",
  "from-green-600/30 to-emerald-600/10",
  "from-orange-600/30 to-yellow-600/10",
  "from-red-600/30 to-pink-600/10",
  "from-violet-600/30 to-indigo-600/10",
];
const deptAccents = ["text-pink-400", "text-blue-400", "text-green-400", "text-orange-400", "text-red-400", "text-violet-400"];

export function HomeDepartments({ departments }: { departments?: any[] }) {
  const deptList = departments || [];

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
        {deptList.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Belum ada data departemen"
              description="Departemen akan tampil di sini setelah ditambahkan melalui Admin Panel."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deptList.map((dept, i) => (
              <Link
                key={dept.id}
                href={`/organisasi/departemen/${dept.slug || dept.id}`}
                className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col group"
              >
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
        )}
      </div>
    </section>
  );
}

export function HomePrograms({ programs, departments }: { programs?: any[]; departments?: any[] }) {
  const programList = (programs || []).slice(0, 6);
  const deptList = departments || [];

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
        {programList.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Belum ada program kerja"
              description="Program kerja akan tampil di sini setelah ditambahkan oleh Admin Departemen."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programList.map((proker) => {
              const dept = deptList.find((d) => d.id === proker.department_id || d.slug === proker.department_id);
              return (
                <div key={proker.id} className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                        {dept?.name || "BEM FKIP UIKA"}
                      </span>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          proker.status === "SELESAI"
                            ? "bg-green-500/20 text-green-300"
                            : proker.status === "BERJALAN"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {proker.status === "SELESAI" ? "Selesai" : proker.status === "BERJALAN" ? "Sedang Berjalan" : "Belum Mulai"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{proker.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{proker.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-glass-border text-xs text-muted-foreground">
                    <span className="text-white font-medium">Target Waktu:</span> {proker.target_waktu || "Periode Aktif"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function HomeEvents({ events }: { events?: any[] }) {
  const eventList = events || [];

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
        {eventList.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Belum ada agenda kegiatan berstatus Terbit"
              description="Kegiatan baru akan otomatis muncul setelah diterbitkan melalui Admin."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {eventList.map((ev) => {
              const eventSlugOrId = ev.slug || ev.id;
              const isOpen = ev.registration_status === "TERBUKA";

              return (
                <div key={ev.id} className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col justify-between shadow-lg">
                  {/* Poster / Banner Image */}
                  {ev.poster_url ? (
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/40 border-b border-glass-border">
                      <img
                        src={ev.poster_url}
                        alt={ev.name}
                        className="w-full h-full object-cover brightness-90 transition duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span
                        className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-md ${
                          isOpen
                            ? "bg-green-500/80 text-white border border-green-400/40"
                            : "bg-yellow-500/80 text-white border border-yellow-400/40"
                        }`}
                      >
                        {isOpen ? "Pendaftaran Terbuka" : "Segera Dibuka"}
                      </span>
                    </div>
                  ) : (
                    <div className="relative h-24 w-full overflow-hidden bg-gradient-to-br from-brand/30 via-purple-900/20 to-black/60 p-4 flex items-end justify-between border-b border-glass-border">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isOpen
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        }`}
                      >
                        {isOpen ? "Pendaftaran Terbuka" : "Segera Dibuka"}
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-2">
                        <Calendar className="size-4 shrink-0" />
                        <span>{new Date(ev.start_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white hover:text-accent transition">
                        <Link href={`/kegiatan/${eventSlugOrId}`}>{ev.name}</Link>
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{ev.description}</p>
                    </div>

                    <div className="pt-4 border-t border-glass-border space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-4 text-accent shrink-0" /> {ev.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="size-4 text-accent shrink-0" /> Kuota: {ev.max_participants ?? "∞"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href={`/kegiatan/${eventSlugOrId}`}
                          className="focus-ring flex-1 text-center rounded-xl border border-glass-border px-3 py-2 text-xs font-semibold text-white hover:border-accent hover:text-accent transition"
                        >
                          Detail Acara
                        </Link>
                        {isOpen && (
                          <Link
                            href={`/kegiatan/${eventSlugOrId}/daftar`}
                            className="focus-ring flex-1 text-center rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-hover transition inline-flex items-center justify-center gap-1 shadow-md"
                          >
                            Daftar Acara <ArrowUpRight className="size-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function HomeNews({ contents }: { contents?: any[] }) {
  const newsList = contents || [];

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
        {newsList.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Belum ada berita berstatus Terbit"
              description="Berita baru akan muncul di sini setelah disetujui dan diterbitkan oleh Super Admin."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {newsList.slice(0, 3).map((news: any) => {
              const thumbnail = news.thumbnail_url || "/images/news-scholarship.png";

              return (
                <Link key={news.id} href={`/berita/${news.slug}`} className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col justify-between shadow-lg">
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image src={thumbnail} alt={news.title} fill className="object-cover brightness-75 transition duration-500 hover:scale-105" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-full bg-accent/90 text-white text-[10px] font-bold px-2.5 py-0.5 uppercase">
                      {news.category}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white line-clamp-2 leading-snug">{news.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{news.excerpt}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-glass-border flex justify-between items-center text-xs text-muted-foreground">
                      <span>{news.published_at ? new Date(news.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Terbaru"}</span>
                      <span className="text-accent flex items-center gap-1 font-medium">{news.reading_time || 3} min <ArrowUpRight className="size-3" /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function HomeDocuments({ documents }: { documents?: any[] }) {
  const docList = (documents || []).slice(0, 6);

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
        {docList.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Belum ada dokumen publik"
              description="Dokumen resmi yang ditandai sebagai publik akan otomatis tampil di sini."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {docList.map((doc) => (
              <div key={doc.id} className="glass rounded-3xl p-5 transition duration-300 hover:border-accent/50 flex flex-col justify-between">
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
                  <Link
                    href="/dokumen"
                    className="focus-ring rounded-lg border border-glass-border px-3 py-1 text-xs font-medium hover:border-accent hover:text-accent"
                  >
                    Lihat Dokumen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

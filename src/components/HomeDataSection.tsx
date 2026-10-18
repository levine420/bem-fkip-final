"use client";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  BookOpen,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";


/* ─── Section Header (light-mode style matching reference) ─── */
function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D] mb-1">
          <Icon className="w-4 h-4" />
          <span>{eyebrow}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─── View-all pill button ─── */
function ViewAllBtn({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors whitespace-nowrap"
    >
      {label} <ArrowRight className="w-4 h-4 text-[#E11D74]" />
    </Link>
  );
}

/* ═══════════════════════════════════════════════
   HOME DEPARTMENTS
═══════════════════════════════════════════════ */
export function HomeDepartments({ departments }: { departments?: any[] }) {
  const deptList = departments || [];

  return (
    <section id="departemen" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-gradient-to-br from-pink-50/60 via-white to-slate-50 rounded-2xl border border-pink-100/80 p-6 sm:p-10">
        <SectionHeader
          icon={Building2}
          eyebrow="Struktur Eksekutif"
          title="Departemen & Biro Kerja"
          description="Setiap departemen memiliki fokus kerja terarah untuk melayani mahasiswa dan sivitas FKIP UIKA."
          action={<ViewAllBtn href="/organisasi/departemen" label="Semua departemen" />}
        />
        {deptList.length === 0 ? (
          <EmptyState
            title="Belum ada data departemen"
            description="Departemen akan tampil di sini setelah ditambahkan melalui Admin Panel."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {deptList.map((dept) => (
              <motion.div
                key={dept.id}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="group"
              >
                <Link
                  href={`/organisasi/departemen/${dept.slug || dept.id}`}
                  className="block p-5 bg-white rounded-xl border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-pink-50 text-[#BE185D] border border-pink-200">
                        {dept.name.slice(0, 4).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#E11D74] transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {dept.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Lihat Profil</span>
                    <span className="text-[#E11D74] font-bold group-hover:translate-x-0.5 transition-transform">
                      Eksplorasi →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   HOME PROGRAMS
═══════════════════════════════════════════════ */
export function HomePrograms({ programs, departments }: { programs?: any[]; departments?: any[] }) {
  const programList = (programs || []).slice(0, 6);
  const deptList = departments || [];

  const statusMap: Record<string, { label: string; cls: string }> = {
    SELESAI: { label: "Selesai", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    BERJALAN: { label: "Sedang Berjalan", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    BELUM_MULAI: { label: "Belum Mulai", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
    DITUNDA: { label: "Ditunda", cls: "bg-slate-100 text-slate-600 border border-slate-200" },
    DIBATALKAN: { label: "Dibatalkan", cls: "bg-red-50 text-red-600 border border-red-200" },
  };

  return (
    <section id="program-kerja" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <SectionHeader
        icon={ArrowRight}
        eyebrow="Program Kerja"
        title="Transparansi pelaksanaan program kerja"
        description="Program kerja dikelompokkan per departemen dan periode, dengan status yang diperbarui oleh pengurus."
        action={<ViewAllBtn href="/organisasi/program-kerja" label="Lihat program kerja" />}
      />
      {programList.length === 0 ? (
        <EmptyState
          title="Belum ada program kerja"
          description="Program kerja akan tampil di sini setelah ditambahkan oleh Admin Departemen."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programList.map((proker) => {
            const dept = deptList.find(
              (d) => d.id === proker.department_id || d.slug === proker.department_id
            );
            const status = statusMap[proker.status] || { label: proker.status, cls: "bg-slate-100 text-slate-600 border border-slate-200" };
            return (
              <motion.div
                key={proker.id}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className="p-5 bg-white rounded-xl border border-slate-200/90 hover:border-pink-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-[#BE185D]">
                      {dept?.name || "BEM FKIP UIKA"}
                    </span>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{proker.name}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {proker.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="text-slate-700 font-medium">Target:</span>{" "}
                  {proker.target_waktu || "Belum ditentukan"}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════
   HOME EVENTS
═══════════════════════════════════════════════ */
export function HomeEvents({ events }: { events?: any[] }) {
  const eventList = events || [];

  const regStatusMap: Record<string, string> = {
    TERBUKA: "Pendaftaran Terbuka",
    PENUH: "Kuota Penuh",
    TUTUP: "Pendaftaran Ditutup",
    SEGERA_DIBUKA: "Segera Dibuka",
  };

  return (
    <section id="kegiatan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <SectionHeader
        icon={Calendar}
        eyebrow="Agenda Terdekat"
        title="Kegiatan Mahasiswa FKIP"
        description="Jadwal kegiatan akademik, pelatihan kepemimpinan, dan aksi sosial terdekat."
        action={<ViewAllBtn href="/kegiatan/kalender" label="Buka Kalender Lengkap" />}
      />
      {eventList.length === 0 ? (
        <EmptyState
          title="Belum ada agenda kegiatan berstatus Terbit"
          description="Kegiatan baru akan otomatis muncul setelah diterbitkan melalui Admin."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {eventList.map((ev) => {
            const eventSlugOrId = ev.slug || ev.id;
            const isOpen = ev.registration_status === "TERBUKA";
            const formattedDate = new Date(ev.start_time).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            });
            return (
              <motion.div
                key={ev.id}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="group bg-white rounded-xl border border-slate-200/90 hover:border-pink-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  {ev.poster_url ? (
                    <img
                      src={ev.poster_url}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-50 to-slate-100">
                      <Calendar className="size-12 text-pink-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                        isOpen ? "bg-emerald-500/90 text-white" : "bg-slate-700/80 text-white"
                      }`}
                    >
                      {regStatusMap[ev.registration_status] || ev.registration_status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#BE185D]">
                      <Clock className="size-3.5 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#E11D74] transition-colors line-clamp-2 leading-snug">
                      <Link href={`/kegiatan/${eventSlugOrId}`}>{ev.name}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-3.5 text-slate-400 shrink-0" />
                      <span>Kuota: {ev.max_participants ?? "∞"}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/kegiatan/${eventSlugOrId}`}
                        className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors"
                      >
                        Detail Acara
                      </Link>
                      {isOpen && (
                        <Link
                          href={`/kegiatan/${eventSlugOrId}/daftar`}
                          className="flex-1 text-center rounded-lg bg-[#E11D74] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#BE185D] transition-colors inline-flex items-center justify-center gap-1"
                        >
                          Daftar <ArrowUpRight className="size-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════
   HOME NEWS — Editorial Layout (reference style)
═══════════════════════════════════════════════ */
export function HomeNews({ contents }: { contents?: any[] }) {
  const newsList = contents || [];
  const featured = newsList[0];
  const rest = newsList.slice(1, 4);

  return (
    <section id="berita" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <SectionHeader
        icon={BookOpen}
        eyebrow="Warta FKIP Terkini"
        title="Informasi, Prestasi & Opini"
        description="Publikasi resmi, rilis advokasi, dan kabar prestasi mahasiswa keguruan."
        action={<ViewAllBtn href="/berita" label="Lihat Semua Berita" />}
      />
      {newsList.length === 0 ? (
        <EmptyState
          title="Belum ada berita berstatus Terbit"
          description="Berita baru akan muncul di sini setelah disetujui dan diterbitkan oleh Super Admin."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {featured && (
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="lg:col-span-7 group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-pink-300 hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <Link href={`/berita/${featured.slug}`} className="flex flex-col flex-1">
                <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
                  {featured.thumbnail_url ? (
                    <img
                      src={featured.thumbnail_url}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-50 to-slate-100">
                      <BookOpen className="size-16 text-pink-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-md bg-[#E11D74] px-3 py-1 text-xs font-bold text-white">
                      Berita Utama
                    </span>
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#BE185D]">{featured.category}</span>
                      {featured.published_at && (
                        <>
                          <span>•</span>
                          <time dateTime={new Date(featured.published_at).toISOString()}>
                            {new Date(featured.published_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              timeZone: "Asia/Jakarta",
                            })}
                          </time>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-[#E11D74] transition-colors leading-tight">
                      {featured.title}
                    </h3>
                    {featured.excerpt && (
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {featured.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                    {featured.author && (
                      <span className="font-medium text-slate-700">Oleh: {featured.author.name}</span>
                    )}
                    <span className="text-[#BE185D] font-bold group-hover:underline flex items-center gap-1">
                      Baca Selengkapnya →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {rest.map((article) => (
              <motion.div
                key={article.id}
                whileHover={{ x: 4, transition: { duration: 0.18 } }}
                className="group"
              >
                <Link
                  href={`/berita/${article.slug}`}
                  className="flex gap-4 items-start p-4 bg-white rounded-xl border border-slate-200/90 hover:border-pink-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {article.thumbnail_url ? (
                      <img
                        src={article.thumbnail_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="size-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-[#BE185D]">{article.category}</div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#E11D74] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                    {article.published_at && (
                      <time
                        className="text-[11px] text-slate-400"
                        dateTime={new Date(article.published_at).toISOString()}
                      >
                        {new Date(article.published_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "Asia/Jakarta",
                        })}
                      </time>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════
   HOME DOCUMENTS
═══════════════════════════════════════════════ */
export function HomeDocuments({ documents }: { documents?: any[] }) {
  const docList = (documents || []).slice(0, 6);

  return (
    <section id="dokumen" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <SectionHeader
        icon={FileText}
        eyebrow="Dokumen"
        title="Arsip publik organisasi yang terstruktur"
        description="Dokumen resmi organisasi BEM FKIP UIKA (AD/ART, SK, LPJ, dan Proposal) yang tersedia untuk ditelusuri."
        action={<ViewAllBtn href="/dokumen" label="Semua dokumen" />}
      />
      {docList.length === 0 ? (
        <EmptyState
          title="Belum ada dokumen publik"
          description="Dokumen resmi yang ditandai sebagai publik akan otomatis tampil di sini."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docList.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="p-5 bg-white rounded-xl border border-slate-200/90 hover:border-pink-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                <FileText className="size-12 text-red-300" />
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-50 text-red-500 rounded-md px-1.5 py-0.5 border border-red-100">
                  PDF
                </span>
                <span className="absolute bottom-2 left-3 text-[10px] font-semibold text-[#BE185D] uppercase tracking-wider">
                  {doc.category}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">{doc.name}</h4>
                <p className="text-xs text-slate-400 mt-1 font-mono truncate">{doc.original_filename}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <Link
                  href="/dokumen"
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors"
                >
                  Lihat Dokumen
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

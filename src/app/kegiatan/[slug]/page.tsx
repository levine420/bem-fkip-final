import Link from "next/link";
import { Calendar, MapPin, Users, Clock, ArrowLeft, ArrowUpRight, Building2 } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { getPublicEventByIdOrSlug } from "@/server/public/data";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 60;

export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventByIdOrSlug(slug);

  if (!event) {
    return (
      <PublicPageFrame>
        <PublicPageHero
          eyebrow="Detail Kegiatan"
          title="Kegiatan Tidak Ditemukan"
          description="Kegiatan yang Anda cari mungkin telah dihapus, diarsipkan, atau tidak tersedia."
          breadcrumbs={[{ label: "Kegiatan", href: "/kegiatan" }, { label: "Tidak Ditemukan" }]}
        />
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <EmptyState
              title="Data kegiatan tidak ditemukan"
              description="Silakan kembali ke halaman kegiatan untuk melihat agenda lain yang tersedia di BEM FKIP UIKA Bogor."
            />
            <div className="text-center">
              <Link
                href="/kegiatan"
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover transition shadow-lg"
              >
                <ArrowLeft className="size-4" /> Kembali ke Daftar Kegiatan
              </Link>
            </div>
          </div>
        </section>
      </PublicPageFrame>
    );
  }

  const startDateStr = new Date(event.start_time).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTimeStr = new Date(event.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const endDateStr = event.end_time
    ? new Date(event.end_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const endTimeStr = event.end_time
    ? new Date(event.end_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;

  const regDeadlineStr = event.registration_deadline
    ? new Date(event.registration_deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  const isOpen = event.registration_status === "TERBUKA";
  const eventSlugOrId = event.slug || event.id;

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Detail Kegiatan BEM"
        title={event.name}
        description={event.description}
        breadcrumbs={[
          { label: "Kegiatan", href: "/kegiatan" },
          { label: event.name },
        ]}
      />

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Banner Poster Image */}
          {event.poster_url && (
            <div className="glass rounded-3xl overflow-hidden shadow-2xl border border-glass-border">
              <img
                src={event.poster_url}
                alt={event.name}
                className="w-full max-h-[520px] object-cover object-center"
              />
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content (Left 2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-glass-border pb-4">
                  <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${
                    isOpen
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  }`}>
                    {isOpen ? "Pendaftaran Terbuka" : "Segera Dibuka / Ditutup"}
                  </span>

                  {event.department?.name && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                      <Building2 className="size-3.5" /> {event.department.name}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-3">Deskripsi & Rincian Acara</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Card (Right 1 Column) */}
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 space-y-5 shadow-xl border-accent/30">
                <h3 className="text-base font-bold text-white border-b border-glass-border pb-3">Informasi Acara</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Calendar className="size-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Tanggal & Waktu</p>
                      <p className="text-muted-foreground">{startDateStr} ({startTimeStr} WIB)</p>
                      {endDateStr && <p className="text-muted-foreground">s.d. {endDateStr} ({endTimeStr} WIB)</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Lokasi Pelaksanaan</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="size-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Kuota Peserta</p>
                      <p className="text-muted-foreground">{event.max_participants ? `${event.max_participants} Orang` : "Tidak Terbatas"}</p>
                    </div>
                  </div>

                  {regDeadlineStr && (
                    <div className="flex items-start gap-3">
                      <Clock className="size-4 text-accent mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Batas Pendaftaran</p>
                        <p className="text-muted-foreground">{regDeadlineStr} WIB</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-glass-border">
                  {isOpen ? (
                    <Link
                      href={`/kegiatan/${eventSlugOrId}/daftar`}
                      className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-hover"
                    >
                      Daftar Acara Sekarang <ArrowUpRight className="size-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-2xl bg-muted/20 py-3 text-center text-sm font-semibold text-muted-foreground cursor-not-allowed border border-glass-border"
                    >
                      Pendaftaran Ditutup
                    </button>
                  )}
                </div>
              </div>

              <div className="text-center">
                <Link href="/kegiatan" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition">
                  <ArrowLeft className="size-4" /> Kembali ke Semua Kegiatan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageFrame>
  );
}

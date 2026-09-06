import Link from "next/link";
import { Calendar, MapPin, Users, ArrowUpRight } from "lucide-react";
import { PublicListing } from "@/components/PublicListing";
import { getPublicEvents } from "@/server/public/data";

export const revalidate = 60;

export default async function CalendarPage() {
  const events = await getPublicEvents();

  return (
    <PublicListing
      eyebrow="Kalender Kegiatan"
      title="Kalender & Agenda Kegiatan BEM"
      description="Tampilan kalender dan daftar agenda BEM FKIP UIKA Bogor dengan jadwal, lokasi, dan link pendaftaran terpadu."
      breadcrumbs={[{ label: "Kegiatan", href: "/kegiatan" }, { label: "Kalender" }]}
      toolbar={[
        { label: "Semua Agenda", href: "/kegiatan/kalender" },
      ]}
      emptyTitle="Belum ada kegiatan berstatus Terbit"
      emptyDescription="Event akan tampil otomatis di sini setelah berstatus Terbit atau Berjalan."
    >
      {events.length === 0 ? (
        <div className="col-span-full glass rounded-3xl p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada kegiatan yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {events.map((ev) => {
            const eventSlugOrId = ev.slug || ev.id;
            const isOpen = ev.registration_status === "TERBUKA";

            return (
              <div
                key={ev.id}
                className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col justify-between shadow-lg"
              >
                {/* Poster / Banner Image */}
                {ev.poster_url ? (
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-black/40 border-b border-glass-border">
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
                    {ev.department?.name && (
                      <span className="absolute bottom-3 left-4 rounded-full bg-accent/90 text-white text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider backdrop-blur-md">
                        {ev.department.name}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-brand/30 via-purple-900/20 to-black/60 p-4 flex items-end justify-between border-b border-glass-border">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isOpen
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      }`}
                    >
                      {isOpen ? "Pendaftaran Terbuka" : "Segera Dibuka"}
                    </span>
                    {ev.department?.name && (
                      <span className="rounded-full bg-accent/20 text-accent text-[10px] font-semibold px-2.5 py-0.5 border border-accent/30">
                        {ev.department.name}
                      </span>
                    )}
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
                        <Users className="size-4 text-accent shrink-0" /> Kuota: {ev.max_participants || "Tidak Terbatas"}
                      </span>
                    </div>

                    {/* Action Buttons */}
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
    </PublicListing>
  );
}

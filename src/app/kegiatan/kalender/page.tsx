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
          {events.map((ev) => (
            <div
              key={ev.id}
              className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                    <Calendar className="size-4" />
                    <span>{new Date(ev.start_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    ev.registration_status === "TERBUKA" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"
                  }`}>
                    {ev.registration_status === "TERBUKA" ? "Pendaftaran Terbuka" : "Segera Dibuka"}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">{ev.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{ev.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-glass-border flex flex-wrap items-center justify-between gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-4 text-accent" /> {ev.location}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-4 text-accent" /> Kuota: {ev.max_participants || "Tidak Terbatas"}
                </span>
                <Link
                  href={`/kegiatan/kalender`}
                  className="focus-ring rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover inline-flex items-center gap-1"
                >
                  Detail Acara <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </PublicListing>
  );
}

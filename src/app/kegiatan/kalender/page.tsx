import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users, ArrowUpRight } from "lucide-react";
import { PublicListing } from "@/components/PublicListing";
import { events } from "@/lib/data/public-data";

export default function CalendarPage() {
  return (
    <PublicListing
      eyebrow="Kalender Kegiatan"
      title="Kalender & Agenda Kegiatan BEM"
      description="Tampilan kalender dan daftar agenda BEM FKIP UIKA Bogor dengan jadwal, lokasi, dan link pendaftaran terpadu."
      breadcrumbs={[{ label: "Kegiatan", href: "/kegiatan" }, { label: "Kalender" }]}
      toolbar={[
        { label: "Semua Agenda", href: "/kegiatan/kalender" },
        { label: "Bulan Ini", href: "/kegiatan/kalender" },
      ]}
      emptyTitle="Kalender belum memiliki kegiatan"
      emptyDescription="Event akan tampil otomatis setelah berstatus Terbit atau Berjalan."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="glass rounded-3xl overflow-hidden transition duration-300 hover:border-accent/50 flex flex-col"
          >
            {ev.poster_url && (
              <div className="relative h-48 w-full overflow-hidden">
                <Image src={ev.poster_url} alt={ev.name} fill className="object-cover brightness-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                  ev.registration_status === "TERBUKA" ? "bg-green-500/50 text-green-100" : "bg-yellow-500/50 text-yellow-100"
                }`}>
                  {ev.registration_status === "TERBUKA" ? "Pendaftaran Terbuka" : "Segera Dibuka"}
                </span>
              </div>
            )}
            <div className="p-6 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                  <Calendar className="size-4" />
                  <span>{new Date(ev.start_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{ev.name}</h3>
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
                  href={`/kegiatan/${ev.id}/daftar`}
                  className="focus-ring rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover inline-flex items-center gap-1"
                >
                  Daftar Acara <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PublicListing>
  );
}

import { PublicListing } from "@/components/PublicListing";
import { PublicEventCalendar } from "@/components/PublicEventCalendar";
import { getPublicEvents } from "@/server/public/data";

export const revalidate = 60;

export default async function CalendarPage() {
  const events = await getPublicEvents();

  return (
    <PublicListing
      eyebrow="Kalender Kegiatan"
      title="Kalender & Agenda BEM FKIP UIKA"
      description="Tampilan kalender interaktif dan daftar agenda BEM FKIP UIKA Bogor dengan jadwal, lokasi, dan link pendaftaran terpadu."
      breadcrumbs={[{ label: "Kegiatan", href: "/kegiatan" }, { label: "Kalender" }]}
      emptyTitle="Belum ada kegiatan berstatus Terbit"
      emptyDescription="Event akan tampil otomatis di sini setelah berstatus Terbit atau Berjalan."
    >
      <div className="col-span-full">
        <PublicEventCalendar events={events} today={new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())} />
      </div>
    </PublicListing>
  );
}

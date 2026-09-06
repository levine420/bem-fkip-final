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
      toolbar={[{ label: "Kalender Interaktif", href: "/kegiatan/kalender" }]}
      emptyTitle="Belum ada kegiatan berstatus Terbit"
      emptyDescription="Event akan tampil otomatis di sini setelah berstatus Terbit atau Berjalan."
    >
      <div className="col-span-full">
        <PublicEventCalendar events={events} />
      </div>
    </PublicListing>
  );
}

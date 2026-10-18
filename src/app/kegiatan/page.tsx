import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicEventCalendar } from "@/components/PublicEventCalendar";
import { getPublicEvents } from "@/server/public/data";

export const revalidate = 60;

export default async function ActivitiesPage() {
  const events = await getPublicEvents();

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Kegiatan & Kalender"
        title="Kalender & Agenda BEM FKIP UIKA"
        description="Pilih tanggal pada kalender interaktif untuk melihat agenda acara, waktu pelaksanaan, dan link pendaftaran terpadu."
        breadcrumbs={[{ label: "Kegiatan" }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <PublicEventCalendar
          events={events}
          today={new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date())}
        />
      </div>
    </PublicPageFrame>
  );
}

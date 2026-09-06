import { PublicListing } from "@/components/PublicListing";
import { PublicEventCalendar } from "@/components/PublicEventCalendar";
import { getPublicEvents } from "@/server/public/data";

export const revalidate = 60;

export default async function ActivitiesPage() {
  const events = await getPublicEvents();

  return (
    <PublicListing
      eyebrow="Kegiatan & Kalender"
      title="Kalender & Agenda BEM FKIP UIKA"
      description="Pilih tanggal pada kalender interaktif untuk melihat agenda acara, waktu pelaksanaan, dan link pendaftaran terpadu."
      breadcrumbs={[{ label: "Kegiatan" }]}
      toolbar={[{ label: "Kalender Interaktif", href: "/kegiatan" }]}
      emptyTitle="Belum ada kegiatan yang diterbitkan"
      emptyDescription="Kegiatan dikelola oleh Admin Departemen atau Super Admin dan terikat pada periode kepengurusan."
    >
      <div className="col-span-full">
        <PublicEventCalendar events={events} />
      </div>
    </PublicListing>
  );
}

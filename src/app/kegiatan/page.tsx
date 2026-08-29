import { PublicListing } from "@/components/PublicListing";

export default function ActivitiesPage() {
  return <PublicListing eyebrow="Kegiatan" title="Agenda BEM FKIP UIKA" description="Kegiatan dapat dilihat dalam daftar dan kalender. Pendaftaran hanya tersedia bila status registrasi dibuka." breadcrumbs={[{ label: "Kegiatan" }]} toolbar={[{ label: "Kalender", href: "/kegiatan/kalender" }]} emptyTitle="Belum ada kegiatan yang diterbitkan" emptyDescription="Kegiatan dikelola oleh Admin Departemen atau Super Admin dan terikat pada periode kepengurusan." />;
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStudent } from "@/server/public/student-auth";
import { getStudentEventRegistrations } from "@/server/public/student-portal-data";
import { PortalPage } from "@/components/PortalPage";
import { Calendar, MapPin, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";

export default async function PortalActivitiesPage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/auth/login");
  }

  const registrations = await getStudentEventRegistrations(student.id);

  return (
    <PortalPage
      activeHref="/portal/kegiatan"
      title="Kegiatan Saya"
      description="Daftar riwayat pendaftaran kegiatan dan event kampus yang pernah Anda ikuti."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Riwayat Event ({registrations.length})</h3>
            <p className="text-xs text-muted-foreground">
              Status pendaftaran Anda diperbarui secara real-time oleh pengurus BEM.
            </p>
          </div>
          <Link
            href="/kegiatan/kalender"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark transition shadow-xs"
          >
            <Calendar className="h-3.5 w-3.5" /> Cari Event Lainnya
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Calendar className="h-6 w-6" />
            </div>
            <h4 className="mt-4 font-bold text-foreground">Belum Ada Pendaftaran Event</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Anda belum pernah mendaftar pada kegiatan atau webinar FKIP UIKA.
            </p>
            <Link
              href="/kegiatan/kalender"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-dark transition"
            >
              Lihat Kalender Kegiatan &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {registrations.map((reg) => {
              const eventDate = new Date(reg.event.start_time).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <div
                  key={reg.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand font-bold">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {reg.event.department?.name || "BEM FKIP"}
                          </span>
                          <span className="text-xs text-muted-foreground">• {eventDate}</span>
                        </div>
                        <h4 className="mt-1 text-base font-bold text-foreground">{reg.event.name}</h4>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-brand" /> {reg.event.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          reg.status === "DITERIMA" || reg.status === "HADIR"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : reg.status === "DITOLAK"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {reg.status === "DITERIMA" && <CheckCircle className="h-3.5 w-3.5" />}
                        {reg.status === "MENUNGGU" && <Clock className="h-3.5 w-3.5" />}
                        {reg.status === "DITOLAK" && <XCircle className="h-3.5 w-3.5" />}
                        Status: {reg.status}
                      </span>

                      {reg.decision_note && (
                        <p className="text-[11px] text-muted-foreground italic">
                          Catatan: {reg.decision_note}
                        </p>
                      )}

                      <Link
                        href={`/kegiatan/${reg.event.slug}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        Detail Event <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalPage>
  );
}

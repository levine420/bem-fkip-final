import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStudent } from "@/server/public/student-auth";
import { getStudentAspirations } from "@/server/public/student-portal-data";
import { PortalPage } from "@/components/PortalPage";
import { MessageSquare, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function PortalAspirationsPage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/auth/login");
  }

  const aspirations = await getStudentAspirations(student.id);

  return (
    <PortalPage
      activeHref="/portal/aspirasi"
      title="Aspirasi Saya"
      description="Suara dan masukan yang Anda sampaikan kepada BEM FKIP UIKA secara privat."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Daftar Aspirasi ({aspirations.length})</h3>
            <p className="text-xs text-muted-foreground">
              Semua masukan diproses dan ditindaklanjuti oleh pengurus BEM FKIP.
            </p>
          </div>
          <Link
            href="/portal/aspirasi/baru"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark transition shadow-xs"
          >
            <Plus className="h-4 w-4" /> Tambah Aspirasi Baru
          </Link>
        </div>

        {aspirations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="mt-4 font-bold text-foreground">Belum Ada Aspirasi</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Punya keluhan, saran akademik, atau kritik perbaikan fasilitas kampus?
            </p>
            <Link
              href="/portal/aspirasi/baru"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-dark transition"
            >
              + Kirim Suara Mahasiswa &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {aspirations.map((asp) => (
              <div
                key={asp.id}
                className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold text-brand uppercase">
                        {asp.category}
                      </span>
                      {asp.is_anonymous && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Anonim
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        •{" "}
                        {new Date(asp.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        asp.status === "SELESAI"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : asp.status === "DIPROSES"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : asp.status === "DITOLAK"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {asp.status === "SELESAI" && <CheckCircle2 className="h-3 w-3" />}
                      {asp.status === "DIPROSES" && <Clock className="h-3 w-3" />}
                      {asp.status === "MASUK" && <AlertCircle className="h-3 w-3" />}
                      {asp.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-foreground">{asp.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{asp.body}</p>

                  {asp.response && (
                    <div className="mt-2 rounded-xl border border-brand/20 bg-brand/5 p-4 text-xs">
                      <div className="flex items-center justify-between font-bold text-brand mb-1">
                        <span>Tanggapan Resmi BEM FKIP UIKA</span>
                        {asp.responded_at && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {new Date(asp.responded_at).toLocaleDateString("id-ID")}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground leading-relaxed">{asp.response}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalPage>
  );
}

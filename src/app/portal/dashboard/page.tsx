import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStudent } from "@/server/public/student-auth";
import { getStudentDashboardData } from "@/server/public/student-portal-data";
import { PortalPage } from "@/components/PortalPage";
import { Calendar, MessageSquare, CheckCircle2, User, ChevronRight } from "lucide-react";

export default async function PortalDashboardPage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/auth/login");
  }

  const { registeredEventsCount, aspirationsCount, recentEvents, recentAspirations } =
    await getStudentDashboardData(student.id);

  return (
    <PortalPage
      activeHref="/portal/dashboard"
      title={`Selamat Datang, ${student.name}`}
      description="Pusat aktivitas personal mahasiswa FKIP UIKA: kegiatan, aspirasi pribadi, dan status akun."
    >
      <div className="space-y-6">
        {/* Profile Summary Card */}
        <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-white shadow-md">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{student.name}</h3>
                <p className="text-xs text-muted-foreground">
                  NIM: <span className="font-semibold text-foreground">{student.nim || "-"}</span> |{" "}
                  {student.program_studi_name || "FKIP UIKA"} (Angkatan {student.angkatan || "-"})
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Status Akun: {student.account_status}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/portal/profil"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-xs font-semibold text-foreground shadow-xs hover:border-brand hover:text-brand transition"
            >
              <User className="h-4 w-4" /> Kelola Profil
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Kegiatan Didaftarkan</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-foreground">{registeredEventsCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">Event & Agenda Kampus FKIP</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Aspirasi Dikirim</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-foreground">{aspirationsCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">Suara & Masukan ke BEM</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Quick Action</span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/portal/aspirasi/baru"
                className="inline-flex items-center justify-between rounded-xl bg-brand/10 border border-brand/20 px-3.5 py-2 text-xs font-semibold text-brand hover:bg-brand hover:text-white transition"
              >
                <span>+ Kirim Aspirasi Baru</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/kegiatan/kalender"
                className="inline-flex items-center justify-between rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:border-brand hover:text-brand transition"
              >
                <span>Cari Kegiatan Kampus</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Registered Events & Aspirations Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Events */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h4 className="font-bold text-foreground">Kegiatan Terbaru Saya</h4>
              <Link href="/portal/kegiatan" className="text-xs font-semibold text-accent hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Belum ada pendaftaran kegiatan. <br />
                  <Link href="/kegiatan/kalender" className="mt-2 inline-block font-semibold text-brand hover:underline">
                    Daftar kegiatan kampus sekarang &rarr;
                  </Link>
                </div>
              ) : (
                recentEvents.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 p-3.5 text-xs transition hover:border-brand/30"
                  >
                    <div>
                      <h5 className="font-bold text-foreground">{item.event.name}</h5>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(item.event.start_time).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • {item.event.location}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        item.status === "DITERIMA" || item.status === "HADIR"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : item.status === "DITOLAK"
                          ? "bg-red-500/10 text-red-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Aspirations */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h4 className="font-bold text-foreground">Aspirasi Saya</h4>
              <Link href="/portal/aspirasi" className="text-xs font-semibold text-accent hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentAspirations.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Belum ada aspirasi yang dikirim. <br />
                  <Link href="/portal/aspirasi/baru" className="mt-2 inline-block font-semibold text-brand hover:underline">
                    Kirim suara & masukan ke BEM &rarr;
                  </Link>
                </div>
              ) : (
                recentAspirations.map((asp) => (
                  <div
                    key={asp.id}
                    className="flex flex-col gap-2 rounded-xl border border-border/60 p-3.5 text-xs transition hover:border-brand/30"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-foreground">{asp.title}</h5>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          asp.status === "SELESAI"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : asp.status === "DIPROSES"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {asp.status}
                      </span>
                    </div>
                    {asp.response && (
                      <div className="rounded-lg bg-muted/50 p-2 text-[11px] text-muted-foreground border border-border/40">
                        <span className="font-semibold text-brand">Balasan BEM: </span>
                        {asp.response}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
}

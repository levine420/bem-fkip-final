import Link from "next/link";
import { requireAdminPage } from "@/server/admin/auth";
import { getAdminDashboardStats } from "@/server/admin/dashboard";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { LogoutButton } from "@/components/admin/AuthForm";
import { adminNavigation } from "@/config/site";
import {
  Building2,
  FileText,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Plus,
  ChevronRight,
  Clock,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const actor = await requireAdminPage();
  const stats = await getAdminDashboardStats(actor);

  const navigation = adminNavigation.filter(
    (item) => actor.role === "SUPER_ADMIN" || item.href !== "/admin/organisasi/periode"
  );

  return (
    <WorkspaceShell
      productLabel="Admin Control Center"
      title="Dashboard Admin BEM FKIP"
      description={`Ringkasan aktivitas dan kontrol administrasi sistem. Hak akses: ${
        actor.role === "SUPER_ADMIN" ? "Super Admin (Cakupan Sistem Penuh)" : "Admin Departemen"
      }.`}
      navigation={navigation}
      activeHref="/admin/dashboard"
      exitHref="/"
      exitLabel="Website Publik"
    >
      <div className="space-y-6">
        {/* User Status Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-glass-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-brand font-bold text-white shadow-xs">
              {actor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm sm:text-base">{actor.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 font-semibold text-brand">
                  <ShieldCheck className="size-3" /> {actor.role === "SUPER_ADMIN" ? "Super Admin" : "Admin Departemen"}
                </span>
                {stats.activePeriod && (
                  <span>• Periode Aktif: <strong className="text-foreground">{stats.activePeriod.name}</strong></span>
                )}
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Real Live Stat Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Departemen BEM</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Building2 className="size-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-foreground">{stats.departmentCount}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">Departemen aktif periode ini</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Konten / Berita</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="size-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-foreground">{stats.contentCount}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">Artikel berita & pengumuman</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Event / Kegiatan</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Calendar className="size-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-foreground">{stats.eventCount}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">Agenda kegiatan tersimpan</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-brand/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Aspirasi Mahasiswa</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <MessageSquare className="size-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-foreground">{stats.aspirationCount}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">Pesan & masukan dari portal</p>
          </div>
        </div>

        {/* Quick Action & Main Administrative Features */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Action Menu */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-1 space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h4 className="font-bold text-foreground text-base">Aksi Cepat</h4>
              <p className="text-xs text-muted-foreground">Pintasan menu utama manajemen.</p>
            </div>
            <div className="grid gap-2.5">
              <Link
                href="/admin/konten/baru"
                className="flex items-center justify-between rounded-xl bg-brand px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition"
              >
                <span className="flex items-center gap-2">
                  <Plus className="size-4" /> Buat Artikel Konten Baru
                </span>
                <ChevronRight className="size-4" />
              </Link>

              <Link
                href="/admin/layanan/kegiatan"
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs font-semibold text-foreground hover:border-brand hover:text-brand transition"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="size-4 text-brand" /> Kelola Event & Peserta
                </span>
                <ChevronRight className="size-4" />
              </Link>

              <Link
                href="/admin/layanan/aspirasi"
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs font-semibold text-foreground hover:border-brand hover:text-brand transition"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-amber-500" /> Respon Aspirasi
                </span>
                <ChevronRight className="size-4" />
              </Link>

              {actor.role === "SUPER_ADMIN" && (
                <Link
                  href="/admin/organisasi/periode"
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs font-semibold text-foreground hover:border-brand hover:text-brand transition"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="size-4 text-purple-500" /> Kelola Periode Kepengurusan
                  </span>
                  <ChevronRight className="size-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Pending Content Reviews or Recent Activity */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h4 className="font-bold text-foreground text-base">Status Konten & Berita Terbaru</h4>
                <p className="text-xs text-muted-foreground">Artikel berita yang siap dan menunggu review.</p>
              </div>
              <Link href="/admin/konten" className="text-xs font-semibold text-accent hover:underline">
                Kelola Semua Konten
              </Link>
            </div>

            <div className="space-y-3">
              {stats.recentContents.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Belum ada artikel konten yang dibuat.
                </div>
              ) : (
                stats.recentContents.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-1.5 rounded-xl border border-border/60 p-3.5 text-xs transition hover:border-brand/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                          {c.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground">• Penulis: {c.author.name}</span>
                      </div>
                      <h5 className="mt-1 font-bold text-foreground">{c.title}</h5>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        c.status === "TERBIT"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : c.status === "MENUNGGU_REVIEW"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.status === "TERBIT" ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Audit Logs (Super Admin view) */}
        {actor.role === "SUPER_ADMIN" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-brand" />
                <h4 className="font-bold text-foreground text-base">Activity Log Sistem Terkini</h4>
              </div>
              <Link href="/admin/activity-log" className="text-xs font-semibold text-accent hover:underline">
                Buka Log Audit Lengkap
              </Link>
            </div>

            <div className="space-y-2.5">
              {stats.recentLogs.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">Belum ada catatan aktivitas.</p>
              ) : (
                stats.recentLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-xl bg-muted/30 px-3.5 py-2.5 text-xs border border-border/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] font-bold text-brand uppercase bg-brand/10 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-foreground">
                        oleh <strong>{log.actor?.name || "Sistem"}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

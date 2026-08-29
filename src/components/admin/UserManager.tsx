"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { ManagedUser, UserAction, UserList } from "@/lib/admin/access";
import type { DepartmentSummary, PeriodOptions, PeriodSummary } from "@/lib/admin/organization";
import { actionClass, adminApi, ApiError, errorMessage } from "./api";
import { OrganizationPicker } from "./OrganizationPicker";
type Editor = { id?: string; version?: number; name: string; email: string; role: "ADMIN" | "SUPER_ADMIN";
  password: string; confirmation: string; period: PeriodSummary | null; department: DepartmentSummary | null };
type ActionEditor = { target: ManagedUser; action: UserAction; reason: string; confirmed: boolean; password: string; confirmation: string };
const labels: Record<UserAction, string> = { disable: "Nonaktifkan sementara", enable: "Aktifkan kembali", revoke: "Cabut assignment permanen", "reset-password": "Reset password" };
export function UserManager({ cohort }: { cohort: "admins" | "students" }) {
  const students = cohort === "students";
  const [data, setData] = useState<UserList | null>(null), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [q, setQ] = useState(""), [search, setSearch] = useState(""), [status, setStatus] = useState(""), [page, setPage] = useState(1), [refresh, setRefresh] = useState(0);
  const [program, setProgram] = useState<DepartmentSummary | null>(null), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null), [action, setAction] = useState<ActionEditor | null>(null), [fields, setFields] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true; setLoading(true); setData(null); setError("");
    const params = new URLSearchParams({ cohort, q: search, status, page: String(page), ...(program ? { program_studi_id: program.id } : {}) });
    adminApi<UserList>(`/api/admin/users?${params}`).then((result) => {
      if (!live) return;
      if (result.total && !result.items.length && page > 1) { setPage(Math.ceil(result.total / result.page_size)); return; }
      setData(result);
    }).catch((cause) => { if (live) setError(errorMessage(cause)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [cohort, search, status, page, refresh, program]);
  function report(cause: unknown) { setError(errorMessage(cause)); if (cause instanceof ApiError) setFields(cause.fields ?? {}); }
  function clearFeedback() { setError(""); setNotice(""); setFields({}); }
  async function create() {
    setBusy(true); clearFeedback();
    try {
      const context = await adminApi<PeriodOptions>("/api/admin/organization/periods");
      setAction(null); setEditor({ name: "", email: "", role: "ADMIN", password: "", confirmation: "", period: context.default_period, department: null });
    } catch (cause) { report(cause); } finally { setBusy(false); }
  }
  function edit(user: ManagedUser) {
    clearFeedback(); setAction(null); setEditor({ id: user.id, version: user.version, name: user.name, email: user.email,
      role: user.role as "ADMIN" | "SUPER_ADMIN", password: "", confirmation: "", period: null, department: null });
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editor || busy) return;
    setBusy(true); clearFeedback();
    const body = editor.id ? { name: editor.name, version: editor.version } : { name: editor.name, email: editor.email, role: editor.role,
      password: editor.password, confirmation: editor.confirmation,
      department_id: editor.role === "ADMIN" ? editor.department?.id ?? null : null, period_id: editor.role === "ADMIN" ? editor.period?.id ?? null : null };
    try {
      await adminApi(`/api/admin/users${editor.id ? `/${editor.id}` : ""}`, editor.id ? "PATCH" : "POST", body);
      setNotice(editor.id ? "Nama akun diperbarui." : "Akun dibuat; wajib ganti password saat login pertama. Tidak ada email kredensial yang dikirim. Sampaikan akses awal melalui saluran aman yang lu kelola.");
      setEditor(null); setPage(1); setRefresh((r) => r + 1);
    } catch (cause) { report(cause); } finally { setBusy(false); }
  }
  async function applyAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!action || busy) return;
    setBusy(true); clearFeedback();
    try {
      await adminApi(`/api/admin/users/${action.target.id}/${action.action}`, "POST", { version: action.target.version, reason: action.reason, confirmed: action.confirmed,
        ...(action.action === "reset-password" ? { password: action.password, confirmation: action.confirmation } : {}) });
      setNotice(action.action === "reset-password" ? "Password direset; sesi lama diputus dan akun wajib mengganti password sementara. Tidak ada email yang dikirim." : "Status akses diperbarui; sesi lama diputus dan alasan dicatat di Activity Log.");
      setAction(null); setRefresh((r) => r + 1);
    } catch (cause) { report(cause); } finally { setBusy(false); }
  }
  function chooseAction(target: ManagedUser, value: UserAction) { clearFeedback(); setEditor(null); setAction({ target, action: value, reason: "", confirmed: false, password: "", confirmation: "" }); }
  return <div className="grid gap-4">
    <section className="glass grid gap-4 rounded-3xl p-5 sm:p-7">
      <nav aria-label="Pengelolaan pengguna" className="flex flex-wrap gap-2"><Link href="/admin/pengguna/admin" className={actionClass} aria-current={!students ? "page" : undefined}>Akun Admin</Link><Link href="/admin/pengguna/mahasiswa" className={actionClass} aria-current={students ? "page" : undefined}>Mahasiswa</Link><Link href="/admin/program-studi" className={actionClass}>Program Studi</Link></nav>
      <p className="text-sm text-muted-foreground">{students ? "Hanya akun mahasiswa yang sudah terdaftar. Panel ini tidak membuat akun, mengedit identitas akademik, atau melewati verifikasi email." : "Akun dan assignment terpisah dari roster/pengurus. Email, role, departemen dan periode tidak dipindahkan lewat edit akun. Periode berikutnya memakai akun Admin baru."}</p>
      {!students && <button className={`${actionClass} w-fit bg-brand`} disabled={busy || loading || !data} onClick={create}>Tambah Admin</button>}
    </section>
    {notice && <p role="status" className="glass rounded-2xl p-4 text-sm text-soft">{notice}</p>}
    {error && <div role="alert" className="glass rounded-2xl p-4 text-sm text-soft"><p>{error}</p><button className={`${actionClass} mt-3`} disabled={busy} onClick={() => setRefresh((r) => r + 1)}>Muat ulang daftar</button>{(editor || action) && <p className="mt-2 text-xs">Form tetap terbuka. Jika versi atau periode berubah, batalkan lalu buka data terbaru.</p>}</div>}
    {Object.keys(fields).length > 0 && <ul role="alert" className="glass rounded-2xl p-4 text-sm text-soft">{Object.entries(fields).map(([key, value]) => <li key={key}>{key}: {value}</li>)}</ul>}
    {editor && <form onSubmit={save} aria-busy={busy} className="glass grid gap-4 rounded-3xl p-5 sm:p-7">
      <h2 className="font-semibold">{editor.id ? "Edit nama akun" : "Akun Admin baru"}</h2>
      <label className="text-sm">Nama<input className="form-control mt-2" required minLength={3} maxLength={100} disabled={busy} value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} /></label>
      {editor.id ? <p className="text-sm text-muted-foreground">{editor.email} · {editor.role}. Identitas dan penugasan tidak dapat diganti.</p> : <>
        <label className="text-sm">Email<input className="form-control mt-2" required type="email" autoComplete="off" maxLength={100} disabled={busy} value={editor.email} onChange={(e) => setEditor({ ...editor, email: e.target.value })} /></label>
        <p className="text-xs text-muted-foreground">Email harus belum digunakan, termasuk oleh akun mahasiswa atau Admin periode lama. Form ini tidak mengonversi role akun yang sudah ada.</p>
        <label className="text-sm">Peran<select className="form-control mt-2" disabled={busy} value={editor.role} onChange={(e) => setEditor({ ...editor, role: e.target.value as Editor["role"], department: null })}><option value="ADMIN">Admin Departemen</option><option value="SUPER_ADMIN">Super Admin</option></select></label>
        {editor.role === "ADMIN" && <>
          <p className="text-sm">Periode aktif saat form dibuka: {editor.period?.name ?? "Belum ada"}</p>
          {editor.period ? <OrganizationPicker key={editor.period.id} label="Departemen penugasan" path={`/api/admin/departments?period_id=${editor.period.id}`} value={editor.department} disabled={busy} onChange={(item) => setEditor({ ...editor, department: item })} />
            : <p className="text-sm text-soft">Aktifkan periode terlebih dahulu, lalu buka ulang form ini.</p>}
        </>}
        <label className="text-sm">Password awal<input className="form-control mt-2" required type="password" autoComplete="new-password" minLength={12} disabled={busy} value={editor.password} onChange={(e) => setEditor({ ...editor, password: e.target.value })} /></label>
        <label className="text-sm">Konfirmasi password<input className="form-control mt-2" required type="password" autoComplete="new-password" disabled={busy} value={editor.confirmation} onChange={(e) => setEditor({ ...editor, confirmation: e.target.value })} /></label>
        <p className="text-xs text-muted-foreground">Minimal 12 karakter dengan huruf besar, kecil, angka; maksimal 72 byte UTF-8. Tidak ada kredensial default atau pengiriman password melalui email.</p>
      </>}
      <div className="flex gap-2"><button className={`${actionClass} bg-brand`} disabled={busy || (!editor.id && editor.role === "ADMIN" && !editor.department)}>{busy ? "Menyimpan…" : "Simpan"}</button><button className={actionClass} type="button" disabled={busy} onClick={() => setEditor(null)}>Batal</button></div>
    </form>}
    {action && <form onSubmit={applyAction} aria-busy={busy} className="glass grid gap-4 rounded-3xl p-5 sm:p-7">
      <h2 className="font-semibold">{labels[action.action]} · {action.target.name}</h2><p className="text-sm text-muted-foreground">{action.target.email}</p>
      <p className="text-sm text-soft">{action.action === "revoke" ? "Assignment ini dicabut permanen. Akun menjadi nonaktif dan tidak dapat diaktifkan kembali lewat tombol aktivasi." : action.action === "disable" ? "Akun tidak dapat login dan sesi diputus. Assignment tetap tersimpan; aktivasi kembali hanya bila syarat akses masih terpenuhi." : action.action === "enable" ? "Aktivasi tidak memulihkan assignment yang dicabut/diarsipkan dan tidak menggantikan verifikasi email mahasiswa." : "Semua sesi akun ini diputus. Password sementara wajib diganti sebelum mengakses modul Admin; status nonaktif tidak otomatis berubah menjadi aktif."}</p>
      <label className="text-sm">Alasan (10–500 karakter; jangan isi password)<textarea className="form-control mt-2" required minLength={10} maxLength={500} disabled={busy} value={action.reason} onChange={(e) => setAction({ ...action, reason: e.target.value })} /></label>
      {action.action === "reset-password" && <><label className="text-sm">Password sementara<input className="form-control mt-2" required type="password" autoComplete="new-password" minLength={12} disabled={busy} value={action.password} onChange={(e) => setAction({ ...action, password: e.target.value })} /></label><label className="text-sm">Konfirmasi password<input className="form-control mt-2" required type="password" autoComplete="new-password" disabled={busy} value={action.confirmation} onChange={(e) => setAction({ ...action, confirmation: e.target.value })} /></label></>}
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-1" disabled={busy} checked={action.confirmed} onChange={(e) => setAction({ ...action, confirmed: e.target.checked })} />Saya memahami dampak tindakan pada akun yang disebut di atas.</label>
      <div className="flex gap-2"><button className={`${actionClass} bg-brand`} disabled={busy || !action.confirmed}>{busy ? "Memproses…" : labels[action.action]}</button><button type="button" className={actionClass} disabled={busy} onClick={() => setAction(null)}>Batal</button></div>
    </form>}
    <section className="glass grid gap-4 rounded-3xl p-5 sm:p-7" aria-busy={loading}>
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); setSearch(q); setPage(1); }}>
        <label className="min-w-0 flex-1 text-sm">{students ? "Cari nama, email, NIM, atau prodi" : "Cari nama atau email"}<input className="form-control mt-2" type="search" maxLength={100} disabled={busy} value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <label className="text-sm">Status<select className="form-control mt-2" disabled={busy} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Semua</option><option value="AKTIF">Aktif</option><option value="NONAKTIF">Nonaktif</option><option value="BELUM_VERIFIKASI">Belum verifikasi</option></select></label><button className={actionClass} disabled={busy}>Cari</button>
      </form>
      {students && <OrganizationPicker label="Filter program studi" path="/api/admin/study-programs" value={program} clearLabel="Semua program studi" disabled={busy} onChange={(item) => { setProgram(item); setPage(1); }} />}
      {loading ? <p role="status" className="py-6 text-muted-foreground">Memuat akun…</p> : data && <>
        {!data.items.length && <p className="py-6 text-sm text-muted-foreground">Tidak ada akun yang sesuai filter. Tidak ada data contoh yang ditambahkan.</p>}
        {data.items.map((user) => {
          const a = user.admin_assignments_user, live = a && !a.revoked_at && a.period.status === "AKTIF" && !a.department.deleted_at;
          const editable = user.role === "SUPER_ADMIN" || (user.role === "ADMIN" && live), self = user.id === data.actor_id;
          const enable = user.account_status === "NONAKTIF" && (user.role === "SUPER_ADMIN" || (user.role === "ADMIN" && live) || (user.role === "MAHASISWA" && user.email_verified_at));
          return <article key={user.id} className="rounded-2xl border border-glass-border p-4">
            <h3 className="break-words font-semibold">{user.name}{self ? " · akun lu" : ""}</h3><p className="mt-1 break-words text-sm text-muted-foreground">{user.email}</p><p className="mt-2 text-xs text-accent">{user.role} · {user.account_status}{user.must_change_password && user.role !== "MAHASISWA" ? " · wajib ganti password" : ""}</p>
            {students ? <p className="mt-2 text-sm text-muted-foreground">NIM: {user.nim ?? "Tidak tersedia"} · {user.study_program?.name ?? "Prodi tidak tersedia"} · Angkatan {user.angkatan ?? "tidak tersedia"}</p>
              : <p className="mt-2 text-sm text-muted-foreground">{a ? `${a.department.name} · ${a.period.name} · ${a.revoked_at ? "Assignment dicabut" : a.period.status}` : user.role === "SUPER_ADMIN" ? "Akses lintas periode" : "Assignment tidak tersedia"}</p>}
            <div className="mt-3 flex flex-wrap gap-2">{editable && <button className={actionClass} disabled={busy} onClick={() => edit(user)}>Edit nama</button>}
              {!self && user.account_status !== "NONAKTIF" && <button className={actionClass} disabled={busy} onClick={() => chooseAction(user, "disable")}>Nonaktifkan</button>}
              {!self && enable && <button className={actionClass} disabled={busy} onClick={() => chooseAction(user, "enable")}>Aktifkan kembali</button>}
              {!self && user.role === "ADMIN" && a && !a.revoked_at && a.period.status !== "ARSIP" && <button className={`${actionClass} text-soft`} disabled={busy} onClick={() => chooseAction(user, "revoke")}>Cabut assignment</button>}
              {!self && editable && <button className={actionClass} disabled={busy} onClick={() => chooseAction(user, "reset-password")}>Reset password</button>}
              {self && <Link className={actionClass} href="/admin/ganti-password">Ganti password pribadi</Link>}
            </div>
          </article>;
        })}
        <nav aria-label="Halaman pengguna" className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{data.total} akun · Halaman {page}</span><div className="flex gap-2"><button className={actionClass} disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</button><button className={actionClass} disabled={busy || page * data.page_size >= data.total} onClick={() => setPage(page + 1)}>Berikutnya</button></div></nav>
      </>}
    </section>
  </div>;
}

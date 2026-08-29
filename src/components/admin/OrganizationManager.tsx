"use client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { DepartmentSummary, OrganizationItem, OrganizationKind, OrganizationResult, PeriodOptions, PeriodSummary } from "@/lib/admin/organization";
import { actionClass, adminApi, ApiError, errorMessage } from "./api";
import { OrganizationPicker } from "./OrganizationPicker";
import { ImageUploader } from "@/components/ImageUploader";

type Editor = { id?: string; version?: number; name: string; slug: string; description: string; logo_url: string;
  position: string; photo_url: string; display_order: string; department: DepartmentSummary | null };
const blank: Editor = { name: "", slug: "", description: "", logo_url: "", position: "", photo_url: "", display_order: "1", department: null };
const title: Record<OrganizationKind, string> = { departments: "Departemen", "department-members": "Anggota Departemen", "board-members": "Struktur Pengurus" };
export function OrganizationManager({ kind }: { kind: OrganizationKind }) {
  const isDepartment = kind === "departments", isBoard = kind === "board-members";
  const [period, setPeriod] = useState<PeriodSummary | null>(null), [superAdmin, setSuperAdmin] = useState(false);
  const [initializing, setInitializing] = useState(true), [initRetry, setInitRetry] = useState(0);
  const [data, setData] = useState<OrganizationResult | null>(null), [loading, setLoading] = useState(false);
  const [error, setError] = useState(""), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
  const [query, setQuery] = useState(""), [search, setSearch] = useState(""), [page, setPage] = useState(1), [refresh, setRefresh] = useState(0);
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentSummary | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null), [fields, setFields] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true; setInitializing(true); setError("");
    adminApi<PeriodOptions>("/api/admin/organization/periods").then((result) => {
      if (live) { setSuperAdmin(result.super_admin); setPeriod(result.default_period ?? result.items[0] ?? null); }
    }).catch((cause) => { if (live) setError(errorMessage(cause)); }).finally(() => { if (live) setInitializing(false); });
    return () => { live = false; };
  }, [initRetry]);
  useEffect(() => {
    if (!period) return;
    let live = true; setLoading(true); setData(null); setError("");
    const params = new URLSearchParams({ period_id: period.id, q: search, page: String(page), ...(departmentFilter ? { department_id: departmentFilter.id } : {}) });
    adminApi<OrganizationResult>(`/api/admin/${kind}?${params}`).then((result) => {
      if (!live) return;
      if (result.total > 0 && !result.items.length && page > 1) { setPage(Math.ceil(result.total / result.page_size)); return; }
      setData(result);
    }).catch((cause) => { if (live) setError(errorMessage(cause)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [period, kind, search, page, refresh, departmentFilter]);
  const currentPeriod = data?.period ?? period;
  const readOnly = currentPeriod?.status === "ARSIP";
  const departmentPath = period ? `/api/admin/departments?period_id=${encodeURIComponent(period.id)}` : "";
  function edit(item: OrganizationItem) {
    const next: Editor = { ...blank, id: item.id, version: item.version, name: item.name };
    if ("slug" in item) { next.slug = item.slug; next.description = item.description ?? ""; next.logo_url = item.logo_url ?? ""; }
    else { next.position = item.position; next.photo_url = item.photo_url ?? ""; next.display_order = String(item.display_order); next.department = item.department; }
    setEditor(next); setFields({}); setError(""); setNotice("");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editor || !period || busy || readOnly) return;
    setBusy(true); setError(""); setNotice(""); setFields({});
    const context = editor.id ? { version: editor.version } : { period_id: period.id };
    const values = isDepartment
      ? { ...context, description: editor.description, logo_url: editor.logo_url, ...(superAdmin ? { name: editor.name, slug: editor.slug } : {}) }
      : { ...context, name: editor.name, position: editor.position, photo_url: editor.photo_url, display_order: editor.display_order,
        ...(!editor.id || isBoard ? { department_id: editor.department?.id ?? null } : {}) };
    try {
      await adminApi(`/api/admin/${kind}${editor.id ? `/${editor.id}` : ""}`, editor.id ? "PATCH" : "POST", values);
      setEditor(null); setNotice("Data organisasi tersimpan dan dicatat di Activity Log."); setPage(1); setRefresh((r) => r + 1);
    } catch (cause) { setError(errorMessage(cause)); if (cause instanceof ApiError) setFields(cause.fields ?? {}); }
    finally { setBusy(false); }
  }
  async function remove(item: OrganizationItem) {
    if (busy || readOnly || !data?.can_delete) return;
    if (!window.confirm(`Hapus ${item.name}?\n\nData akan disembunyikan, bukan dihapus permanen dari database. Pemulihan belum tersedia.${isDepartment ? " Departemen yang masih memiliki data terkait atau akses Admin akan ditolak." : " Aksi ini tidak mengubah akses akun Admin."}`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await adminApi(`/api/admin/${kind}/${item.id}`, "DELETE", { version: item.version, confirmed: true });
      if (editor?.id === item.id) setEditor(null);
      setNotice("Data dihapus dari daftar aktif; riwayat tetap tersimpan."); setRefresh((r) => r + 1);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  }
  function field(key: "name" | "slug" | "description" | "logo_url" | "position" | "photo_url" | "display_order", label: string, required = true) {
    if (!editor) return null;
    const props = { id: `${kind}-${key}`, className: "form-control mt-2", value: editor[key], disabled: busy || !!readOnly, required,
      "aria-invalid": !!fields[key], "aria-describedby": fields[key] ? `${kind}-${key}-error` : undefined,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditor({ ...editor, [key]: e.target.value }) };
    return <div><label htmlFor={props.id} className="text-sm">{label}</label>{key === "description" ? <textarea {...props} rows={5} maxLength={10000} /> :
      <input {...props} type={key === "display_order" ? "number" : key.endsWith("_url") ? "url" : "text"}
        min={key === "display_order" ? 1 : undefined} max={key === "display_order" ? 2147483647 : undefined} step={key === "display_order" ? 1 : undefined}
        minLength={key === "name" ? 3 : undefined} maxLength={key.endsWith("_url") ? 1024 : key === "slug" ? 150 : 100} />}
      {fields[key] && <p id={`${kind}-${key}-error`} className="mt-1 text-xs text-soft">{fields[key]}</p>}</div>;
  }
  return <div className="grid gap-4">
    <section className="glass grid gap-4 rounded-3xl p-5 sm:p-7">
      <h2 className="text-xl font-semibold">{title[kind]}</h2>
      <p className="text-sm text-muted-foreground">{isDepartment ? "Super Admin mengelola identitas departemen. Admin Departemen hanya mengedit deskripsi dan logo miliknya." : isBoard ? "Struktur resmi dikelola Super Admin. Pengurus inti boleh tanpa departemen; data ini tidak memberikan akses akun." : "Roster anggota terpisah dari struktur pengurus dan hak akses Admin."}</p>
      {initializing ? <p role="status">Memuat lingkup akses…</p> : <OrganizationPicker label="Periode organisasi" path="/api/admin/organization/periods" value={currentPeriod} disabled={busy}
        onChange={(item) => { if (!item || item.id === period?.id) return; if (editor && !window.confirm("Ganti periode dan tutup form yang belum disimpan?")) return;
          setPeriod(item as PeriodSummary); setEditor(null); setDepartmentFilter(null); setPage(1); setData(null); setNotice(""); setError(""); }} />}
      {!initializing && !period && !error && <p className="text-sm text-muted-foreground">Belum ada periode. Super Admin perlu membuat periode di menu Periode terlebih dahulu.</p>}
      {readOnly && <p role="status" className="rounded-xl border border-glass-border p-3 text-sm text-soft">Arsip · hanya baca, termasuk untuk Super Admin.</p>}
      {currentPeriod?.status === "NONAKTIF" && <p className="text-sm text-muted-foreground">Persiapan organisasi periode draf. Perubahan di sini tidak mengaktifkan periode atau akun Admin.</p>}
      {data?.can_create && <button className={`${actionClass} w-fit bg-brand`} disabled={busy || loading} onClick={() => { setEditor({ ...blank }); setFields({}); setError(""); setNotice(""); }}>Tambah {isDepartment ? "departemen" : isBoard ? "pengurus" : "anggota"}</button>}
    </section>
    {notice && <p role="status" className="glass rounded-2xl p-4 text-sm text-soft">{notice}</p>}
    {error && <div role="alert" className="glass rounded-2xl p-4 text-sm text-soft"><p>{error}</p><button type="button" className={`${actionClass} mt-3`} disabled={busy} onClick={() => period ? setRefresh((r) => r + 1) : setInitRetry((r) => r + 1)}>Muat ulang daftar</button>
      {editor && <p className="mt-2 text-xs">Input belum dibuang. Jika terjadi konflik versi, batalkan edit lalu buka data terbaru.</p>}</div>}
    {editor && <form onSubmit={save} className="glass grid gap-4 rounded-3xl p-5 sm:p-7" aria-busy={busy}>
      <h3 className="font-semibold">{editor.id ? "Edit" : "Tambah"} · {title[kind]} · {currentPeriod?.name}</h3>
      {(!isDepartment || superAdmin) && field("name", "Nama")}
      {isDepartment ? <>{superAdmin && field("slug", "Slug — huruf kecil, angka, tanda hubung")}{field("description", "Deskripsi (opsional)", false)}
        <ImageUploader
          label="Logo Departemen (opsional)"
          value={editor.logo_url}
          onChange={(url) => setEditor({ ...editor, logo_url: url })}
        />
      </> : <>
        {field("position", "Jabatan")}{field("display_order", "Urutan tampil — mulai dari 1")}
        {!editor.id || isBoard ? <OrganizationPicker key={period?.id} label="Departemen" path={departmentPath} value={editor.department} disabled={busy || !!readOnly}
          clearLabel={isBoard ? "Pengurus inti / tanpa departemen" : undefined} onChange={(item) => setEditor({ ...editor, department: item })} />
          : <p className="text-sm">Departemen: {editor.department?.name}. Untuk pindah departemen, hapus entri lama lalu buat entri baru.</p>}
        {fields.department_id && <p role="alert" className="text-xs text-soft">{fields.department_id}</p>}
        <ImageUploader
          label="Foto Pengurus / Anggota (opsional)"
          value={editor.photo_url}
          onChange={(url) => setEditor({ ...editor, photo_url: url })}
        />
      </>}
      <div className="flex gap-2"><button className={`${actionClass} bg-brand`} disabled={busy || !!readOnly}>{busy ? "Menyimpan…" : "Simpan"}</button><button type="button" className={actionClass} disabled={busy} onClick={() => setEditor(null)}>Batal</button></div>
    </form>}
    {period && <section className="glass grid gap-4 rounded-3xl p-5 sm:p-7" aria-busy={loading}>
      <form onSubmit={(e) => { e.preventDefault(); setSearch(query); setPage(1); }} className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm">{isDepartment ? "Cari nama departemen" : "Cari nama atau jabatan"}<input type="search" className="form-control mt-2" value={query} maxLength={100} disabled={busy} onChange={(e) => setQuery(e.target.value)} /></label>
        <button className={actionClass} disabled={busy}>Cari</button></form>
      {!isDepartment && <OrganizationPicker key={period.id} label="Filter departemen" path={departmentPath} value={departmentFilter} clearLabel="Semua dalam lingkup akses" disabled={busy}
        onChange={(item) => { setDepartmentFilter(item); setPage(1); }} />}
      {loading ? <p role="status" className="py-5 text-muted-foreground">Memuat data organisasi…</p> : data && <>
        {!data.items.length && <p className="py-5 text-sm text-muted-foreground">Belum ada data yang cocok. Tambahkan data resmi atau ubah filter pencarian.</p>}
        {data.items.map((item) => <article key={item.id} className="rounded-2xl border border-glass-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold">{item.name}</h3>
            {"slug" in item ? <><p className="mt-1 break-words text-xs text-accent">{item.slug}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.description || "Deskripsi belum diisi."}</p></>
              : <><p className="mt-1 break-words text-sm text-soft">{item.position}</p><p className="mt-1 text-xs text-muted-foreground">{item.department?.name ?? "Pengurus inti / tanpa departemen"} · Urutan {item.display_order}</p></>}
          </div>{!readOnly && <div className="flex gap-2"><button className={actionClass} disabled={busy} onClick={() => edit(item)}>Edit</button>{data.can_delete && <button className={`${actionClass} text-soft`} disabled={busy} onClick={() => remove(item)}>Hapus</button>}</div>}</div>
        </article>)}
        <nav aria-label={`Halaman ${title[kind]}`} className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{data.total} data · Halaman {data.page}</span><div className="flex gap-2">
          <button className={actionClass} disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
          <button className={actionClass} disabled={busy || page * data.page_size >= data.total} onClick={() => setPage(page + 1)}>Berikutnya</button></div></nav>
      </>}
    </section>}
  </div>;
}

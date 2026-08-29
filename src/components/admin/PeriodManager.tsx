"use client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { actionClass, adminApi, ApiError, errorMessage } from "./api";
import { ImageUploader } from "@/components/ImageUploader";
type Period = { id: string; name: string; visi: string; misi: string; photo_url: string | null;
  year_start: number; year_end: number; status: "AKTIF" | "NONAKTIF" | "ARSIP"; version: number };
type Result = { items: Period[]; total: number; page: number; page_size: number; active: { id: string; name: string } | null };
type Editor = { id?: string; version?: number; name: string; visi: string; misi: string; photo_url: string; year_start: string; year_end: string };
const emptyEditor: Editor = { name: "", visi: "", misi: "", photo_url: "", year_start: "", year_end: "" };
const labels: Record<Period["status"], string> = { AKTIF: "Aktif", NONAKTIF: "Draf", ARSIP: "Arsip · hanya baca" };
export function PeriodManager() {
  const [data, setData] = useState<Result | null>(null), [loading, setLoading] = useState(true);
  const [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [q, setQ] = useState(""), [search, setSearch] = useState("");
  const [status, setStatus] = useState(""), [sort, setSort] = useState("newest"), [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0), [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null), [fields, setFields] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true; setLoading(true); setError(""); setData(null);
    const params = new URLSearchParams({ q: search, status, sort, page: String(page) });
    adminApi<Result>(`/api/admin/periods?${params}`).then((result) => { if (live) setData(result); })
      .catch((cause) => { if (live) setError(errorMessage(cause)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [search, status, sort, page, refresh]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editor || busy) return;
    setBusy(true); setError(""); setFields({}); setNotice("");
    const { id, version, ...values } = editor;
    try {
      await adminApi(`/api/admin/periods${id ? `/${id}` : ""}`, id ? "PATCH" : "POST", { ...values, ...(id ? { version } : {}) });
      setEditor(null); setNotice(id ? "Perubahan periode tersimpan." : "Periode draf berhasil dibuat."); setPage(1); setRefresh((r) => r + 1);
    } catch (cause) { setError(errorMessage(cause)); if (cause instanceof ApiError) setFields(cause.fields ?? {}); }
    finally { setBusy(false); }
  }
  async function activate(item: Period) {
    if (busy || loading || !data) return;
    const warning = data.active ? `Periode ${data.active.name} akan diarsipkan secara permanen. Akun dan sesi Admin Departemen periode lama akan dinonaktifkan.` : "Ini akan menjadi periode aktif pertama.";
    if (!window.confirm(`Aktifkan ${item.name}?\n\n${warning}\n\nLanjutkan?`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await adminApi(`/api/admin/periods/${item.id}/activate`, "POST", { version: item.version, expected_active_id: data.active?.id ?? null, confirmed: true });
      setNotice(`${item.name} sekarang aktif. Perubahan dan pencabutan akses dicatat dalam transaksi yang sama.`);
      setRefresh((r) => r + 1);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  }
  function edit(item: Period) {
    setEditor({ id: item.id, version: item.version, name: item.name, visi: item.visi, misi: item.misi,
      photo_url: item.photo_url ?? "", year_start: String(item.year_start), year_end: String(item.year_end) });
    setFields({}); setError(""); setNotice("");
  }
  function field(key: keyof Omit<Editor, "id" | "version">, label: string, multiline = false) {
    if (!editor) return null;
    const props = { id: `period-${key}`, name: key, value: editor[key], disabled: busy,
      required: key !== "photo_url", "aria-invalid": !!fields[key], "aria-describedby": fields[key] ? `error-${key}` : undefined,
      className: "form-control mt-2", onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditor({ ...editor, [key]: e.target.value }) };
    return <div><label htmlFor={`period-${key}`} className="text-sm">{label}</label>
      {multiline ? <textarea {...props} maxLength={key === "visi" ? 500 : 10000} /> :
        <input {...props} type={key.startsWith("year") ? "number" : key === "photo_url" ? "url" : "text"}
          min={key.startsWith("year") ? 1000 : undefined} max={key.startsWith("year") ? 9999 : undefined} maxLength={key === "name" ? 100 : 1024} />}
      {fields[key] && <p id={`error-${key}`} className="mt-1 text-xs text-soft">{fields[key]}</p>}</div>;
  }
  return <div className="grid gap-4">
    <section className="glass rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Pergantian kepengurusan</h2><p className="mt-2 text-sm text-muted-foreground">Buat draf, lengkapi data resmi, lalu aktifkan. Arsip tidak dapat diedit atau dihapus.</p></div>
        <button className={`${actionClass} bg-brand`} disabled={busy} onClick={() => { setEditor({ ...emptyEditor }); setFields({}); setError(""); }}>Buat periode</button></div>
      {data && <p className="mt-4 rounded-xl border border-glass-border p-3 text-sm">{data.active ? <>Periode aktif: <strong>{data.active.name}</strong></> : "Belum ada periode aktif. Aktivasi pertama dapat dilakukan setelah draf lengkap."}</p>}
    </section>
    {notice && <p role="status" className="glass rounded-2xl p-4 text-sm text-soft">{notice}</p>}
    {error && <div role="alert" className="glass rounded-2xl border-danger/50 p-4"><p className="text-sm text-soft">{error}</p><button className={`${actionClass} mt-3`} disabled={busy} onClick={() => setRefresh((r) => r + 1)}>Muat ulang daftar</button>{editor && <p className="mt-2 text-xs text-muted-foreground">Input form tetap disimpan. Jika data bentrok, batalkan edit dan buka kembali data terbaru.</p>}</div>}
    {editor && <form className="glass grid gap-4 rounded-3xl p-5 sm:p-7" onSubmit={save} aria-busy={busy}>
      <h2 className="text-xl font-semibold">{editor.id ? "Edit periode" : "Periode baru"}</h2>
      {field("name", "Nama kabinet")}
      <div className="grid gap-4 sm:grid-cols-2">{field("year_start", "Tahun mulai")}{field("year_end", "Tahun selesai")}</div>
      {field("visi", "Visi", true)}{field("misi", "Misi — minimal satu poin", true)}
      <ImageUploader
        label="Foto / Banner Kabinet Periode (opsional)"
        value={editor.photo_url}
        onChange={(url) => setEditor({ ...editor, photo_url: url })}
      />
      <div className="flex gap-2"><button className={`${actionClass} bg-brand`} disabled={busy}>{busy ? "Menyimpan…" : "Simpan"}</button><button className={actionClass} type="button" disabled={busy} onClick={() => setEditor(null)}>Batal</button></div>
    </form>}
    <section className="glass rounded-3xl p-5 sm:p-7" aria-busy={loading}>
      <form onSubmit={(event) => { event.preventDefault(); setSearch(q); setPage(1); }} className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm">Cari kabinet<input className="form-control mt-2" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} type="search" /></label>
        <label className="text-sm">Status<select className="form-control mt-2" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Semua</option><option value="NONAKTIF">Draf</option><option value="AKTIF">Aktif</option><option value="ARSIP">Arsip</option></select></label>
        <label className="text-sm">Urutkan<select className="form-control mt-2" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="newest">Tahun terbaru</option><option value="oldest">Tahun terlama</option><option value="name">Nama kabinet</option></select></label>
        <button className={actionClass}>Cari</button>
      </form>
      {loading ? <p role="status" className="py-8 text-muted-foreground">Memuat periode…</p> : data && <>
        {!data.items.length && <div className="py-10"><h3 className="font-semibold">Tidak ada periode yang ditemukan</h3><p className="mt-2 text-sm text-muted-foreground">Buat periode pertama atau ubah filter pencarian.</p></div>}
        <div className="mt-5 grid gap-3">{data.items.map((item) => <article key={item.id} className="rounded-2xl border border-glass-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-accent">{labels[item.status]}</p><h3 className="mt-1 font-semibold">{item.name}</h3><p className="text-sm text-muted-foreground">{item.year_start}–{item.year_end}</p></div>
            {item.status !== "ARSIP" && <div className="flex flex-wrap gap-2"><button className={actionClass} disabled={busy} onClick={() => edit(item)}>Edit</button>{item.status === "NONAKTIF" && <button className={`${actionClass} text-soft`} disabled={busy} onClick={() => activate(item)}>Aktifkan</button>}</div>}</div>
          <details className="mt-3 text-sm"><summary className="focus-ring cursor-pointer py-2">Visi & misi</summary><h4 className="mt-2 font-semibold">Visi</h4><p className="whitespace-pre-wrap break-words text-muted-foreground">{item.visi}</p><h4 className="mt-3 font-semibold">Misi</h4><p className="whitespace-pre-wrap break-words text-muted-foreground">{item.misi}</p></details>
        </article>)}</div>
        <nav aria-label="Halaman periode" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{data.total} periode · Halaman {data.page}</span><div className="flex gap-2"><button className={actionClass} disabled={page === 1 || busy} onClick={() => setPage((p) => p - 1)}>Sebelumnya</button><button className={actionClass} disabled={page * data.page_size >= data.total || busy} onClick={() => setPage((p) => p + 1)}>Berikutnya</button></div></nav>
      </>}
    </section>
  </div>;
}

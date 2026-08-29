"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { StudyProgram, StudyProgramList } from "@/lib/admin/access";
import { actionClass, adminApi, errorMessage } from "./api";
type Editor = { id?: string; version?: number; code: string; name: string };
export function StudyProgramManager() {
  const [data, setData] = useState<StudyProgramList | null>(null), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [q, setQ] = useState(""), [search, setSearch] = useState(""), [page, setPage] = useState(1), [refresh, setRefresh] = useState(0);
  const [editor, setEditor] = useState<Editor | null>(null), [error, setError] = useState(""), [notice, setNotice] = useState("");
  useEffect(() => {
    let live = true; setLoading(true); setData(null); setError("");
    adminApi<StudyProgramList>(`/api/admin/study-programs?${new URLSearchParams({ q: search, page: String(page) })}`).then((result) => {
      if (!live) return;
      if (result.total && !result.items.length && page > 1) { setPage(Math.ceil(result.total / result.page_size)); return; } setData(result);
    }).catch((cause) => { if (live) setError(errorMessage(cause)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [search, page, refresh]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editor || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { id, version, ...values } = editor;
      await adminApi(`/api/admin/study-programs${id ? `/${id}` : ""}`, id ? "PATCH" : "POST", { ...values, ...(id ? { version } : {}) });
      setEditor(null); setNotice("Program studi tersimpan dan dicatat di Activity Log."); setPage(1); setRefresh((r) => r + 1);
    } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  }
  async function remove(item: StudyProgram) {
    if (busy || !window.confirm(`Hapus ${item.name}?\n\nHanya program studi tanpa referensi akun yang dapat dihapus. Nama/kode tetap dicadangkan; pemulihan belum tersedia.`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await adminApi(`/api/admin/study-programs/${item.id}`, "DELETE", { confirmed: true, version: item.version });
      if (editor?.id === item.id) setEditor(null);
      setNotice("Program studi dihapus dari daftar aktif; riwayat tetap tersimpan."); setRefresh((r) => r + 1);
    } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  }
  return <div className="grid gap-4">
    <section className="glass rounded-3xl p-5 sm:p-7"><h2 className="text-xl font-semibold">Master Program Studi</h2><p className="mt-2 text-sm text-muted-foreground">Masukkan data resmi tanpa seed contoh. Koreksi nama/kode berlaku pada semua akun yang merujuk master ini; identitas prodi pada akun tidak dipindahkan.</p><button className={`${actionClass} mt-4 bg-brand`} disabled={busy || loading || !data} onClick={() => { setEditor({ code: "", name: "" }); setError(""); }}>Tambah program studi</button></section>
    {notice && <p role="status" className="glass rounded-2xl p-4 text-sm text-soft">{notice}</p>}
    {error && <div role="alert" className="glass rounded-2xl p-4 text-sm text-soft"><p>{error}</p><button className={`${actionClass} mt-3`} disabled={busy} onClick={() => setRefresh((r) => r + 1)}>Muat ulang daftar</button>{editor && <p className="mt-2 text-xs">Input form tetap disimpan. Jika versi bentrok, batalkan edit dan buka data terbaru.</p>}</div>}
    {editor && <form onSubmit={save} aria-busy={busy} className="glass grid gap-4 rounded-3xl p-5 sm:p-7"><h2 className="font-semibold">{editor.id ? "Edit" : "Tambah"} program studi</h2>
      <label className="text-sm">Kode (maksimal 10 karakter)<input className="form-control mt-2" required maxLength={10} disabled={busy} value={editor.code} onChange={(e) => setEditor({ ...editor, code: e.target.value })} /></label>
      <label className="text-sm">Nama resmi<input className="form-control mt-2" required minLength={3} maxLength={255} disabled={busy} value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} /></label>
      <div className="flex gap-2"><button className={`${actionClass} bg-brand`} disabled={busy}>{busy ? "Menyimpan…" : "Simpan"}</button><button type="button" className={actionClass} disabled={busy} onClick={() => setEditor(null)}>Batal</button></div>
    </form>}
    <section className="glass grid gap-4 rounded-3xl p-5 sm:p-7" aria-busy={loading}><form className="flex items-end gap-3" onSubmit={(e) => { e.preventDefault(); setSearch(q); setPage(1); }}><label className="min-w-0 flex-1 text-sm">Cari kode atau nama<input className="form-control mt-2" type="search" maxLength={100} disabled={busy} value={q} onChange={(e) => setQ(e.target.value)} /></label><button className={actionClass} disabled={busy}>Cari</button></form>
      {loading ? <p role="status" className="py-6 text-muted-foreground">Memuat program studi…</p> : data && <>
        {!data.items.length && <p className="py-6 text-sm text-muted-foreground">Belum ada program studi yang sesuai filter.</p>}
        {data.items.map((item) => <article key={item.id} className="rounded-2xl border border-glass-border p-4"><p className="text-xs text-accent">{item.code}</p><h3 className="mt-1 break-words font-semibold">{item.name}</h3><p className="mt-1 text-xs text-muted-foreground">{item._count.users_study_program} referensi akun, termasuk nonaktif/terhapus</p><div className="mt-3 flex gap-2"><button className={actionClass} disabled={busy} onClick={() => { setEditor({ id: item.id, version: item.version, code: item.code, name: item.name }); setError(""); }}>Edit</button><button className={`${actionClass} text-soft`} disabled={busy || item._count.users_study_program > 0} onClick={() => remove(item)}>Hapus</button></div></article>)}
        <nav aria-label="Halaman program studi" className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{data.total} program studi · Halaman {page}</span><div className="flex gap-2"><button className={actionClass} disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</button><button className={actionClass} disabled={busy || page * data.page_size >= data.total} onClick={() => setPage(page + 1)}>Berikutnya</button></div></nav>
      </>}
    </section>
  </div>;
}

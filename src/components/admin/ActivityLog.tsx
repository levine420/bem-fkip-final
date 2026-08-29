"use client";
import { useEffect, useState } from "react";
import { actionClass, adminApi, errorMessage } from "./api";
type Result = { items: { id: string; created_at: string; action: string; target_type: string | null; target_id: string | null; actor: { name: string; role: string } | null }[]; total: number; page_size: number };
export function ActivityLog() {
  const [data, setData] = useState<Result | null>(null), [error, setError] = useState("");
  const [q, setQ] = useState(""), [from, setFrom] = useState(""), [to, setTo] = useState("");
  const [query, setQuery] = useState(""), [page, setPage] = useState(1), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let live = true; setData(null); setError("");
    adminApi<Result>(`/api/admin/activity-log?${query}&page=${page}`).then((result) => { if (live) setData(result); }).catch((cause) => { if (live) setError(errorMessage(cause)); });
    return () => { live = false; };
  }, [query, page, refresh]);
  return <section className="glass rounded-3xl p-5 sm:p-7">
    <form className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4" onSubmit={(e) => { e.preventDefault(); setQuery(new URLSearchParams({ q, from, to }).toString()); setPage(1); }}>
      <label className="text-sm">Cari aksi<input className="form-control mt-2" type="search" value={q} maxLength={100} onChange={(e) => setQ(e.target.value)} /></label>
      <label className="text-sm">Dari (UTC)<input type="date" className="form-control mt-2" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
      <label className="text-sm">Sampai (UTC)<input type="date" className="form-control mt-2" value={to} onChange={(e) => setTo(e.target.value)} /></label><button className={actionClass}>Terapkan filter</button>
    </form>
    {error ? <div role="alert" className="mt-5"><p>{error}</p><button className={`${actionClass} mt-3`} onClick={() => setRefresh((r) => r + 1)}>Coba lagi</button></div> : !data ? <p className="py-8" role="status">Memuat log…</p> : <>
      {!data.items.length && <p className="py-8 text-muted-foreground">Tidak ada aktivitas yang cocok dengan filter.</p>}
      <ul className="mt-5 grid gap-3">{data.items.map((item) => <li key={item.id} className="rounded-2xl border border-glass-border p-4"><p className="font-semibold">{item.action}</p><p className="mt-1 text-sm text-muted-foreground">{item.actor?.name ?? "Sistem / percobaan masuk"}{item.actor ? ` · ${item.actor.role}` : ""}</p><time className="text-xs text-muted-foreground" dateTime={item.created_at}>{new Date(item.created_at).toISOString().replace("T", " ").slice(0, 19)} UTC</time>{item.target_type && <p className="mt-2 break-all text-xs">{item.target_type} · {item.target_id}</p>}</li>)}</ul>
      <nav aria-label="Halaman activity log" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{data.total} aktivitas · Halaman {page}</span><div className="flex gap-2"><button className={actionClass} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</button><button className={actionClass} disabled={page * data.page_size >= data.total} onClick={() => setPage((p) => p + 1)}>Berikutnya</button></div></nav>
    </>}
    <p className="mt-5 text-xs text-muted-foreground">Log hanya baca. Password, token, dan isi aspirasi tidak ditampilkan. IP/browser belum direkam sampai sumber metadata proxy tepercaya ditetapkan.</p>
  </section>;
}

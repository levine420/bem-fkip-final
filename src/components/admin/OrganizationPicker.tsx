"use client";
import { useEffect, useState } from "react";
import { actionClass, adminApi, errorMessage } from "./api";

type Option = { id: string; name: string; status?: string };
type Options = { items: Option[]; total: number; page: number; page_size: number };
// A paginated lookup avoids silently truncating selects at the first 20 rows.
export function OrganizationPicker({ label, path, value, onChange, disabled = false, clearLabel }: {
  label: string; path: string; value: Option | null; onChange: (item: Option | null) => void; disabled?: boolean; clearLabel?: string;
}) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState(""), [search, setSearch] = useState("");
  const [page, setPage] = useState(1), [data, setData] = useState<Options | null>(null);
  const [loading, setLoading] = useState(false), [error, setError] = useState(""), [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    let live = true; setLoading(true); setData(null); setError("");
    const params = new URLSearchParams({ q: search, page: String(page) });
    adminApi<Options>(`${path}${path.includes("?") ? "&" : "?"}${params}`)
      .then((result) => { if (live) setData(result); })
      .catch((cause) => { if (live) setError(errorMessage(cause)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [open, path, search, page, retry]);
  function choose(item: Option | null) { onChange(item); setOpen(false); }
  return <div className="rounded-2xl border border-glass-border p-3">
    <p className="text-sm font-medium">{label}</p>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="text-sm text-muted-foreground">{value?.name ?? clearLabel ?? "Belum dipilih"}{value?.status ? ` · ${value.status}` : ""}</span>
      <div className="flex gap-2"><button type="button" className={actionClass} disabled={disabled} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Tutup pilihan" : "Pilih"}</button>
        {clearLabel && value && <button type="button" className={actionClass} disabled={disabled} onClick={() => choose(null)}>{clearLabel}</button>}</div></div>
    {open && <div className="mt-3 border-t border-glass-border pt-3">
      <div className="flex gap-2"><input aria-label={`Cari ${label}`} className="form-control" type="search" value={query} maxLength={100} disabled={disabled}
        onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setSearch(query); setPage(1); } }} />
        <button type="button" className={actionClass} disabled={disabled} onClick={() => { setSearch(query); setPage(1); }}>Cari</button></div>
      {error && <div role="alert" className="mt-3 text-sm text-soft">{error}<button type="button" className={`${actionClass} ml-2`} onClick={() => setRetry((r) => r + 1)}>Coba lagi</button></div>}
      {loading ? <p role="status" className="py-3 text-sm">Memuat pilihan…</p> : data && <>
        {!data.items.length && <p className="py-3 text-sm text-muted-foreground">Tidak ada pilihan yang cocok.</p>}
        <ul className="mt-3 grid max-h-64 gap-2 overflow-y-auto">{data.items.map((item) => <li key={item.id}><button type="button" className={`${actionClass} w-full justify-between text-left`} disabled={disabled} onClick={() => choose(item)}>
          <span className="break-words">{item.name}</span>{item.status && <span className="ml-2 text-xs text-accent">{item.status}</span>}</button></li>)}</ul>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><span>{data.total} hasil · Halaman {page}</span><div className="flex gap-2">
          <button type="button" className={actionClass} disabled={disabled || page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
          <button type="button" className={actionClass} disabled={disabled || page * data.page_size >= data.total} onClick={() => setPage(page + 1)}>Berikutnya</button></div></div>
      </>}
    </div>}
  </div>;
}

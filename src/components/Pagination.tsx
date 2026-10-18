"use client";
export function Pagination({ page, pageSize, total, busy, onPage }: { page: number; pageSize: number; total: number; busy: boolean; onPage: (page: number) => void }) {
  if (total <= pageSize && page === 1) return null;
  return <nav aria-label="Halaman daftar" className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
    <span>{total} data · Halaman {page}</span>
    <div className="flex gap-2">
      <button type="button" className="button-secondary" disabled={busy || page <= 1} onClick={() => onPage(page - 1)}>Sebelumnya</button>
      <button type="button" className="button-secondary" disabled={busy || page * pageSize >= total} onClick={() => onPage(page + 1)}>Berikutnya</button>
    </div>
  </nav>;
}

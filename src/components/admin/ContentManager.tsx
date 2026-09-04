"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { actionClass, adminApi, errorMessage } from "./api";

type Content = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAF" | "MENUNGGU_REVIEW" | "TERBIT" | "REVISI";
  author: { id: string; name: string };
  department: { id: string; name: string } | null;
  created_at: string;
  published_at: string | null;
  review_note: string | null;
};

type Result = {
  items: Content[];
  total: number;
  page: number;
  page_size: number;
};

const statusLabels: Record<Content["status"], string> = {
  DRAF: "Draf",
  MENUNGGU_REVIEW: "Menunggu Review",
  TERBIT: "Terbit",
  REVISI: "Revisi",
};

const statusColors: Record<Content["status"], string> = {
  DRAF: "bg-gray-500/20 text-gray-300",
  MENUNGGU_REVIEW: "bg-yellow-500/20 text-yellow-300",
  TERBIT: "bg-green-500/20 text-green-300",
  REVISI: "bg-orange-500/20 text-orange-300",
};

const categoryLabels: Record<string, string> = {
  BERITA: "Berita",
  PENGUMUMAN: "Pengumuman",
  KAJIAN: "Kajian",
  RILIS_PERS: "Rilis Pers",
  LAINNYA: "Lainnya",
};

export function ContentManager() {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    setData(null);
    
    const params = new URLSearchParams({
      q: search,
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      page: String(page),
    });
    
    adminApi<Result>(`/api/admin/contents?${params}`)
      .then((result) => { if (live) setData(result); })
      .catch((cause) => { if (live) setError(errorMessage(cause)); })
      .finally(() => { if (live) setLoading(false); });
    
    return () => { live = false; };
  }, [search, status, category, page, refresh]);

  async function submitReview(item: Content) {
    if (busy || !window.confirm(`Submit "${item.title}" untuk review?\n\nKonten tidak dapat diedit setelah disubmit.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    
    try {
      await adminApi(`/api/admin/contents/${item.id}/submit`, "POST");
      setNotice(`"${item.title}" telah disubmit untuk review.`);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function deleteContent(item: Content) {
    if (busy || !window.confirm(`Hapus "${item.title}"?\n\nData akan dihapus secara permanen.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    
    try {
      await adminApi(`/api/admin/contents/${item.id}`, "DELETE");
      setNotice(`"${item.title}" telah dihapus.`);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="grid gap-4">
      <section className="glass rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Manajemen Konten</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola berita, pengumuman, dan kajian. Admin Departemen membuat draf, Super Admin mereview dan menerbitkan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/konten/review" className={`${actionClass} bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/40`}>
              Review &amp; Terbitkan
            </Link>
            <Link href="/admin/konten/baru" className={`${actionClass} bg-brand`}>
              Buat Konten Baru
            </Link>
          </div>
        </div>
      </section>

      {notice && (
        <p role="status" className="glass rounded-2xl p-4 text-sm text-soft">
          {notice}
        </p>
      )}

      {error && (
        <div role="alert" className="glass rounded-2xl border-danger/50 p-4">
          <p className="text-sm text-soft">{error}</p>
          <button
            className={`${actionClass} mt-3`}
            disabled={busy}
            onClick={() => setRefresh((r) => r + 1)}
          >
            Muat ulang daftar
          </button>
        </div>
      )}

      <section className="glass rounded-3xl p-5 sm:p-7" aria-busy={loading}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(q);
            setPage(1);
          }}
          className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <label className="text-sm">
            Cari konten
            <input
              className="form-control mt-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={200}
              type="search"
              placeholder="Judul atau excerpt..."
            />
          </label>
          <label className="text-sm">
            Status
            <select
              className="form-control mt-2"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Status</option>
              <option value="DRAF">Draf</option>
              <option value="MENUNGGU_REVIEW">Menunggu Review</option>
              <option value="TERBIT">Terbit</option>
              <option value="REVISI">Revisi</option>
            </select>
          </label>
          <label className="text-sm">
            Kategori
            <select
              className="form-control mt-2"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Kategori</option>
              <option value="BERITA">Berita</option>
              <option value="PENGUMUMAN">Pengumuman</option>
              <option value="KAJIAN">Kajian</option>
              <option value="RILIS_PERS">Rilis Pers</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </label>
          <button className={`${actionClass} bg-brand/50`} disabled={loading}>
            {loading ? "Memuat…" : "Terapkan"}
          </button>
        </form>

        {loading && (
          <p className="mt-6 text-center text-sm text-muted-foreground">Memuat konten…</p>
        )}

        {!loading && data && data.items.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {search || status || category
                ? "Tidak ada konten yang cocok dengan filter."
                : "Belum ada konten. Buat konten pertama untuk memulai."}
            </p>
          </div>
        )}

        {!loading && data && data.items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="pb-3 text-left font-semibold">Judul</th>
                  <th className="pb-3 text-left font-semibold">Kategori</th>
                  <th className="pb-3 text-left font-semibold">Status</th>
                  <th className="pb-3 text-left font-semibold">Penulis</th>
                  <th className="pb-3 text-left font-semibold">Departemen</th>
                  <th className="pb-3 text-left font-semibold">Dibuat</th>
                  <th className="pb-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b border-glass-border/50">
                    <td className="py-3">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.slug}</p>
                    </td>
                    <td className="py-3">{categoryLabels[item.category]}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[item.status]}`}
                      >
                        {statusLabels[item.status]}
                      </span>
                      {item.status === "REVISI" && item.review_note && (
                        <p className="mt-1 text-xs text-orange-400">Ada catatan revisi</p>
                      )}
                    </td>
                    <td className="py-3">{item.author.name}</td>
                    <td className="py-3">
                      {item.department ? item.department.name : <span className="text-muted-foreground">BEM</span>}
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(item.created_at)}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {(item.status === "DRAF" || item.status === "REVISI") && (
                          <Link
                            href={`/admin/konten/${item.id}`}
                            className="text-accent hover:underline"
                          >
                            Edit
                          </Link>
                        )}
                        {item.status === "DRAF" && (
                          <button
                            className="text-accent hover:underline"
                            onClick={() => submitReview(item)}
                            disabled={busy}
                          >
                            Submit Review
                          </button>
                        )}
                        {item.status !== "DRAF" && item.status !== "REVISI" && (
                          <Link
                            href={`/admin/konten/${item.id}`}
                            className="text-muted-foreground hover:underline"
                          >
                            Lihat
                          </Link>
                        )}
                        <button
                          className="text-red-400 hover:underline hover:text-red-300"
                          onClick={() => deleteContent(item)}
                          disabled={busy}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data && data.total > data.page_size && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Halaman {data.page} dari {Math.ceil(data.total / data.page_size)} · {data.total} konten
            </p>
            <div className="flex gap-2">
              <button
                className={actionClass}
                disabled={page === 1 || busy}
                onClick={() => setPage(page - 1)}
              >
                Sebelumnya
              </button>
              <button
                className={actionClass}
                disabled={page >= Math.ceil(data.total / data.page_size) || busy}
                onClick={() => setPage(page + 1)}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

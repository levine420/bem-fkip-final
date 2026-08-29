"use client";
import { useEffect, useState } from "react";
import { actionClass, adminApi, errorMessage } from "./api";

type Aspiration = {
  id: string;
  title: string;
  body: string;
  category: "AKADEMIK" | "FASILITAS" | "LAYANAN_KAMPUS" | "LAINNYA";
  status: "MASUK" | "DIPROSES" | "SELESAI" | "DITOLAK";
  response: string | null;
  is_anonymous: boolean;
  user_id: string;
  submitter: { id: string; name: string; email: string; nim: string | null };
  handler: { id: string; name: string } | null;
  created_at: string;
  responded_at: string | null;
};

type Result = {
  items: Aspiration[];
  total: number;
  page: number;
  page_size: number;
};

const categoryLabels: Record<Aspiration["category"], string> = {
  AKADEMIK: "Akademik",
  FASILITAS: "Fasilitas Kampus",
  LAYANAN_KAMPUS: "Layanan Kampus",
  LAINNYA: "Lainnya",
};

const statusLabels: Record<Aspiration["status"], string> = {
  MASUK: "Aspirasi Masuk",
  DIPROSES: "Sedang Diproses",
  SELESAI: "Telah Selesai",
  DITOLAK: "Ditolak / Ditutup",
};

const statusColors: Record<Aspiration["status"], string> = {
  MASUK: "bg-blue-500/20 text-blue-300",
  DIPROSES: "bg-yellow-500/20 text-yellow-300",
  SELESAI: "bg-green-500/20 text-green-300",
  DITOLAK: "bg-red-500/20 text-red-300",
};

export function AspirasiManager() {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);

  // Response Modal State
  const [selectedItem, setSelectedItem] = useState<Aspiration | null>(null);
  const [respStatus, setRespStatus] = useState<Aspiration["status"]>("DIPROSES");
  const [respText, setRespText] = useState("");

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q: search,
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      page: String(page),
    });

    adminApi<Result>(`/api/admin/aspirations?${params}`)
      .then((res) => { if (live) setData(res); })
      .catch((cause) => { if (live) setError(errorMessage(cause)); })
      .finally(() => { if (live) setLoading(false); });

    return () => { live = false; };
  }, [search, category, status, page, refresh]);

  function openRespondModal(item: Aspiration) {
    setSelectedItem(item);
    setRespStatus(item.status === "MASUK" ? "DIPROSES" : item.status);
    setRespText(item.response || "");
  }

  async function handleSendResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem || busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await adminApi(`/api/admin/aspirations/${selectedItem.id}`, "PATCH", {
        status: respStatus,
        response: respText || undefined,
      });
      setNotice(`Tanggapan aspirasi "${selectedItem.title}" berhasil diperbarui.`);
      setSelectedItem(null);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="grid gap-4">
      <section className="glass rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Manajemen Bank Aspirasi</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola dan tanggapi aspirasi mahasiswa FKIP UIKA secara privat dan terstruktur.
            </p>
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
        </div>
      )}

      <section className="glass rounded-3xl p-5 sm:p-7" aria-busy={loading}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q);
            setPage(1);
          }}
          className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <label className="text-sm">
            Cari Aspirasi
            <input
              className="form-control mt-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Judul atau isi aspirasi..."
            />
          </label>
          <label className="text-sm">
            Kategori
            <select
              className="form-control mt-2"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">Semua Kategori</option>
              <option value="AKADEMIK">Akademik</option>
              <option value="FASILITAS">Fasilitas Kampus</option>
              <option value="LAYANAN_KAMPUS">Layanan Kampus</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </label>
          <label className="text-sm">
            Status
            <select
              className="form-control mt-2"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">Semua Status</option>
              <option value="MASUK">Aspirasi Masuk</option>
              <option value="DIPROSES">Diproses</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </label>
          <button className={`${actionClass} bg-brand/50`} disabled={loading}>
            {loading ? "Memuat…" : "Terapkan"}
          </button>
        </form>

        {loading && <p className="mt-6 text-center text-sm text-muted-foreground">Memuat aspirasi…</p>}

        {!loading && data && data.items.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {search || category || status ? "Tidak ada aspirasi yang sesuai filter." : "Belum ada aspirasi masuk."}
            </p>
          </div>
        )}

        {!loading && data && data.items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border text-left font-semibold">
                  <th className="pb-3">Judul Aspirasi</th>
                  <th className="pb-3">Pengaju</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Waktu Masuk</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b border-glass-border/50">
                    <td className="py-3">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.body}</p>
                    </td>
                    <td className="py-3">
                      {item.is_anonymous ? (
                        <span className="inline-block bg-gray-500/20 text-gray-300 text-xs px-2 py-0.5 rounded-full font-medium">
                          🔒 Anonim
                        </span>
                      ) : (
                        <div>
                          <p className="font-medium text-xs">{item.submitter.name}</p>
                          <p className="text-xs text-muted-foreground">{item.submitter.nim || item.submitter.email}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-xs">{categoryLabels[item.category]}</td>
                    <td className="py-3 text-xs text-muted-foreground">{formatDate(item.created_at)}</td>
                    <td className="py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => openRespondModal(item)}
                        className={`${actionClass} py-1 text-xs bg-brand/30`}
                      >
                        Tanggapi / Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Response Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-xl shadow-2xl">
            <div className="flex justify-between items-start gap-4 border-b border-glass-border pb-4">
              <div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2 ${statusColors[selectedItem.status]}`}>
                  {statusLabels[selectedItem.status]}
                </span>
                <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Pengaju: {selectedItem.is_anonymous ? "Mahasiswa Anonim" : `${selectedItem.submitter.name} (${selectedItem.submitter.nim || selectedItem.submitter.email})`}
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-white">✕</button>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-glass-border text-sm">
              <p className="text-xs text-muted-foreground mb-1 font-semibold">Isi Aspirasi:</p>
              <p className="whitespace-pre-wrap text-soft">{selectedItem.body}</p>
            </div>

            <form onSubmit={handleSendResponse} className="mt-4 grid gap-3">
              <label className="text-sm">
                Status Penanganan Aspirasi
                <select
                  className="form-control mt-1"
                  value={respStatus}
                  onChange={(e) => setRespStatus(e.target.value as any)}
                >
                  <option value="MASUK">Aspirasi Masuk</option>
                  <option value="DIPROSES">Sedang Diproses Tim BEM</option>
                  <option value="SELESAI">Selesai Ditindaklanjuti</option>
                  <option value="DITOLAK">Ditolak / Tidak Dapat Diproses</option>
                </select>
              </label>

              <label className="text-sm">
                Tanggapan / Catatan BEM (Privat ke Mahasiswa)
                <textarea
                  className="form-control mt-1 h-28"
                  value={respText}
                  onChange={(e) => setRespText(e.target.value)}
                  placeholder="Tuliskan tanggapan resmi dari Tim BEM FKIP UIKA untuk pengaju aspirasi ini..."
                />
              </label>

              {selectedItem.handler && (
                <p className="text-xs text-muted-foreground">
                  Terakhir ditanggapi oleh: <span className="text-accent">{selectedItem.handler.name}</span>
                </p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className={actionClass}
                  disabled={busy}
                >
                  Tutup
                </button>
                <button type="submit" className={`${actionClass} bg-brand`} disabled={busy}>
                  {busy ? "Menyimpan…" : "Kirim Tanggapan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

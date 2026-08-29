"use client";
import { useEffect, useState, type FormEvent } from "react";
import { actionClass, adminApi, errorMessage } from "./api";

type Content = {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  author: { id: string; name: string };
  department: { id: string; name: string } | null;
  created_at: string;
};

type Result = {
  items: Content[];
  total: number;
};

const categoryLabels: Record<string, string> = {
  BERITA: "Berita",
  PENGUMUMAN: "Pengumuman",
  KAJIAN: "Kajian",
  RILIS_PERS: "Rilis Pers",
  LAINNYA: "Lainnya",
};

export function ContentReview() {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    setData(null);
    
    const params = new URLSearchParams({ status: "MENUNGGU_REVIEW" });
    
    adminApi<Result>(`/api/admin/contents?${params}`)
      .then((result) => { if (live) setData(result); })
      .catch((cause) => { if (live) setError(errorMessage(cause)); })
      .finally(() => { if (live) setLoading(false); });
    
    return () => { live = false; };
  }, [refresh]);

  async function publish(item: Content) {
    if (busy || !window.confirm(`Terbitkan "${item.title}"?\n\nKonten akan langsung tampil di website publik.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    
    try {
      await adminApi(`/api/admin/contents/${item.id}/publish`, "POST");
      setNotice(`"${item.title}" telah diterbitkan.`);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function revise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || busy || !reviewNote.trim()) return;
    
    setBusy(true);
    setError("");
    setNotice("");
    
    try {
      await adminApi(`/api/admin/contents/${selectedId}/revise`, "POST", { review_note: reviewNote });
      const item = data?.items.find((i) => i.id === selectedId);
      setNotice(`"${item?.title}" dikembalikan untuk revisi.`);
      setSelectedId(null);
      setReviewNote("");
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const selected = data?.items.find((i) => i.id === selectedId);

  return (
    <div className="grid gap-4">
      <section className="glass rounded-3xl p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-semibold">Review Konten</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Konten yang menunggu review dari Admin Departemen. Anda dapat menerbitkan atau meminta revisi.
          </p>
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

      {loading && (
        <div className="glass rounded-3xl p-5 sm:p-7">
          <p className="text-center text-sm text-muted-foreground">Memuat konten…</p>
        </div>
      )}

      {!loading && data && data.items.length === 0 && (
        <div className="glass rounded-3xl p-5 sm:p-7">
          <p className="text-center text-sm text-muted-foreground">
            Tidak ada konten yang menunggu review.
          </p>
        </div>
      )}

      {!loading && data && data.items.length > 0 && (
        <div className="grid gap-4">
          {data.items.map((item) => (
            <section key={item.id} className="glass rounded-3xl p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-300">
                      {categoryLabels[item.category]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">/{item.slug}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Penulis: {item.author.name}</span>
                    {item.department && <span>Departemen: {item.department.name}</span>}
                    <span>Dibuat: {formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>

              {item.excerpt && (
                <p className="mt-4 text-sm text-muted-foreground">{item.excerpt}</p>
              )}

              {item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="rounded-full bg-glass-border px-2 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-accent hover:underline">
                  Lihat konten lengkap
                </summary>
                <div
                  className="prose prose-invert mt-4 max-w-none rounded-2xl border border-glass-border p-4"
                  dangerouslySetInnerHTML={{ __html: item.body }}
                />
              </details>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`${actionClass} bg-green-600 hover:bg-green-700`}
                  onClick={() => publish(item)}
                  disabled={busy}
                >
                  Terbitkan
                </button>
                <button
                  className={`${actionClass} bg-orange-600 hover:bg-orange-700`}
                  onClick={() => {
                    setSelectedId(item.id);
                    setReviewNote("");
                    setError("");
                  }}
                  disabled={busy}
                >
                  Minta Revisi
                </button>
              </div>

              {selectedId === item.id && (
                <form onSubmit={revise} className="mt-4 rounded-2xl border border-glass-border p-4">
                  <label className="text-sm font-semibold">
                    Catatan Revisi *
                    <textarea
                      className="form-control mt-2"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      required
                      disabled={busy}
                      placeholder="Jelaskan apa yang perlu direvisi..."
                    />
                  </label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Catatan akan dikirim ke penulis. Konten akan kembali ke status REVISI.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button className={`${actionClass} bg-orange-600`} disabled={busy}>
                      {busy ? "Mengirim…" : "Kirim Revisi"}
                    </button>
                    <button
                      className={actionClass}
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setSelectedId(null);
                        setReviewNote("");
                      }}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

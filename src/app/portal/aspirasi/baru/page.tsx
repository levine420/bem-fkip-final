"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalPage } from "@/components/PortalPage";
import { ArrowLeft, Send } from "lucide-react";

export default function NewAspirationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"AKADEMIK" | "FASILITAS" | "LAYANAN_KAMPUS" | "LAINNYA">("AKADEMIK");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      setErrorMsg("Judul dan isi pesan aspirasi wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/student/aspirations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          body,
          is_anonymous: isAnonymous,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Gagal mengirimkan aspirasi.");
      }

      router.push("/portal/aspirasi");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalPage
      activeHref="/portal/aspirasi"
      title="Kirim Aspirasi Baru"
      description="Sampaikan suara, kritik, atau saran untuk perbaikan akademik dan fasilitas kampus FKIP UIKA."
    >
      <div className="mx-auto max-w-2xl">
        <Link
          href="/portal/aspirasi"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand transition mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Riwayat Aspirasi
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xs">
          {errorMsg && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-500">
              {errorMsg}
            </div>
          )}

          <label className="block text-sm font-semibold text-foreground">
            Judul Aspirasi / Topik *
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Contoh: Permohonan perbaikan fasilitas laboratorium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="block text-sm font-semibold text-foreground">
            Kategori *
            <select
              className="form-control mt-2"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              required
              disabled={loading}
            >
              <option value="AKADEMIK">Akademik & Perkuliahan</option>
              <option value="FASILITAS">Fasilitas Kampus & Sarana</option>
              <option value="LAYANAN_KAMPUS">Layanan Kemahasiswaan</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </label>

          <label className="block text-sm font-semibold text-foreground">
            Pesan & Detail Aspirasi *
            <textarea
              className="form-control mt-2 min-h-36 resize-y"
              placeholder="Jelaskan aspirasi, kendala, atau usulan Anda secara rinci..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
            <input
              type="checkbox"
              id="anonymous"
              className="h-4 w-4 rounded text-brand focus:ring-brand"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="anonymous" className="cursor-pointer text-xs font-semibold text-foreground select-none">
              Sembunyikan Identitas Saya (Kirim sebagai Anonim)
              <span className="block text-[11px] font-normal text-muted-foreground">
                Nama Anda tidak akan ditampilkan kepada pengurus BEM, namun status balasan tetap dapat dibaca di portal Anda.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/portal/aspirasi"
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark transition shadow-xs disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {loading ? "Mengirim Aspirasi..." : "Kirim Aspirasi"}
            </button>
          </div>
        </form>
      </div>
    </PortalPage>
  );
}

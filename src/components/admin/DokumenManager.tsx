"use client";
import { useEffect, useState } from "react";
import { actionClass, adminApi, errorMessage } from "./api";

type DocumentItem = {
  id: string;
  name: string;
  original_filename: string;
  storage_key: string;
  file_type: string;
  file_size: number;
  download_count: number;
  is_public: boolean;
  category: "LPJ" | "PROPOSAL" | "SK" | "AD_ART" | "LAPORAN" | "ARSIP";
  uploader: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
  uploaded_at: string;
};

type Result = {
  items: DocumentItem[];
  total: number;
  page: number;
  page_size: number;
};

const categoryLabels: Record<DocumentItem["category"], string> = {
  LPJ: "Laporan Pertanggungjawaban (LPJ)",
  PROPOSAL: "Proposal Kegiatan",
  SK: "Surat Keputusan (SK)",
  AD_ART: "AD / ART Organisasi",
  LAPORAN: "Laporan Bulanan / Tahunan",
  ARSIP: "Arsip Organisasi",
};

export function DokumenManager() {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [isPublicFilter, setIsPublicFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  const [docName, setDocName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("application/pdf");
  const [fileSize, setFileSize] = useState("1048576"); // 1MB default
  const [docCategory, setDocCategory] = useState<DocumentItem["category"]>("ARSIP");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q: search,
      ...(category ? { category } : {}),
      ...(isPublicFilter ? { is_public: isPublicFilter } : {}),
      page: String(page),
    });

    adminApi<Result>(`/api/admin/documents?${params}`)
      .then((res) => { if (live) setData(res); })
      .catch((cause) => { if (live) setError(errorMessage(cause)); })
      .finally(() => { if (live) setLoading(false); });

    return () => { live = false; };
  }, [search, category, isPublicFilter, page, refresh]);

  function openCreateModal() {
    setEditingItem(null);
    setDocName("");
    setFileName("dokumen_bem.pdf");
    setFileType("application/pdf");
    setFileSize("1048576");
    setDocCategory("ARSIP");
    setIsPublic(false);
    setIsModalOpen(true);
  }

  function openEditModal(doc: DocumentItem) {
    setEditingItem(doc);
    setDocName(doc.name);
    setFileName(doc.original_filename);
    setFileType(doc.file_type);
    setFileSize(String(doc.file_size));
    setDocCategory(doc.category);
    setIsPublic(doc.is_public);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (editingItem) {
        await adminApi(`/api/admin/documents/${editingItem.id}`, "PATCH", {
          name: docName,
          category: docCategory,
          is_public: isPublic,
        });
        setNotice(`Dokumen "${docName}" berhasil diperbarui.`);
      } else {
        await adminApi(`/api/admin/documents`, "POST", {
          name: docName,
          original_filename: fileName,
          file_type: fileType,
          file_size: Number(fileSize),
          category: docCategory,
          is_public: isPublic,
        });
        setNotice(`Dokumen "${docName}" berhasil diunggah/ditambahkan.`);
      }
      setIsModalOpen(false);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleTogglePublic(doc: DocumentItem) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await adminApi(`/api/admin/documents/${doc.id}`, "PATCH", {
        is_public: !doc.is_public,
      });
      setNotice(`Akses publik "${doc.name}" diubah menjadi ${!doc.is_public ? "PUBLIK" : "PRIVAT"}.`);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(doc: DocumentItem) {
    if (busy || !window.confirm(`Hapus dokumen "${doc.name}"?`)) return;
    setBusy(true);
    setError("");

    try {
      await adminApi(`/api/admin/documents/${doc.id}`, "DELETE");
      setNotice(`Dokumen "${doc.name}" telah dihapus.`);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("id-ID", {
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
            <h2 className="text-xl font-semibold">Manajemen Dokumen Organisasi</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola berkas publik & arsip internal BEM (LPJ, SK, Proposal, AD/ART).
            </p>
          </div>
          <button onClick={openCreateModal} className={`${actionClass} bg-brand`}>
            + Unggah Dokumen Baru
          </button>
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
            Cari Dokumen
            <input
              className="form-control mt-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nama berkas atau nama file..."
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
              <option value="LPJ">LPJ</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="SK">Surat Keputusan (SK)</option>
              <option value="AD_ART">AD / ART</option>
              <option value="LAPORAN">Laporan</option>
              <option value="ARSIP">Arsip</option>
            </select>
          </label>
          <label className="text-sm">
            Akses Publik
            <select
              className="form-control mt-2"
              value={isPublicFilter}
              onChange={(e) => { setIsPublicFilter(e.target.value); setPage(1); }}
            >
              <option value="">Semua Akses</option>
              <option value="true">Publik Terbuka</option>
              <option value="false">Internal BEM</option>
            </select>
          </label>
          <button className={`${actionClass} bg-brand/50`} disabled={loading}>
            {loading ? "Memuat…" : "Terapkan"}
          </button>
        </form>

        {loading && <p className="mt-6 text-center text-sm text-muted-foreground">Memuat dokumen…</p>}

        {!loading && data && data.items.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {search || category || isPublicFilter ? "Tidak ada dokumen yang cocok dengan filter." : "Belum ada dokumen terunggah."}
            </p>
          </div>
        )}

        {!loading && data && data.items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border text-left font-semibold">
                  <th className="pb-3">Nama Dokumen</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Ukuran / Pengunggah</th>
                  <th className="pb-3">Waktu Unggah</th>
                  <th className="pb-3">Visibilitas</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((doc) => (
                  <tr key={doc.id} className="border-b border-glass-border/50">
                    <td className="py-3">
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{doc.original_filename}</p>
                    </td>
                    <td className="py-3 text-xs">{categoryLabels[doc.category]}</td>
                    <td className="py-3 text-xs">
                      <p>{formatBytes(doc.file_size)}</p>
                      <p className="text-muted-foreground">{doc.uploader ? doc.uploader.name : "System"}</p>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">{formatDate(doc.uploaded_at)}</td>
                    <td className="py-3 text-xs">
                      <button
                        onClick={() => handleTogglePublic(doc)}
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
                          doc.is_public ? "bg-green-500/20 text-green-300 hover:bg-green-500/30" : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30"
                        }`}
                        title="Klik untuk mengubah akses publik"
                      >
                        {doc.is_public ? "🌐 Publik" : "🔒 Privat Internal"}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => alert(`Simulasi Unduh: ${doc.original_filename}`)}
                          className="text-accent hover:underline text-xs"
                        >
                          Unduh
                        </button>
                        <button onClick={() => openEditModal(doc)} className="text-accent hover:underline text-xs" disabled={busy}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(doc)} className="text-soft hover:underline text-xs" disabled={busy}>
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
      </section>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-semibold">{editingItem ? "Edit Dokumen" : "Unggah Dokumen Baru"}</h3>
            <form onSubmit={handleSave} className="mt-4 grid gap-3">
              <label className="text-sm">
                Nama Dokumen / Judul Berkas *
                <input
                  className="form-control mt-1"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Misal: LPJ FKIP Digital Fest 2026"
                />
              </label>

              {!editingItem && (
                <>
                  <label className="text-sm">
                    Nama File Asli *
                    <input
                      className="form-control mt-1"
                      required
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="LPJ_Digital_Fest_2026.pdf"
                    />
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      Tipe File
                      <select className="form-control mt-1" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                        <option value="application/pdf">PDF Document (.pdf)</option>
                        <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word (.docx)</option>
                        <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel (.xlsx)</option>
                        <option value="image/jpeg">JPEG Image (.jpg)</option>
                      </select>
                    </label>
                    <label className="text-sm">
                      Ukuran Berkas (Bytes)
                      <input
                        type="number"
                        className="form-control mt-1"
                        value={fileSize}
                        onChange={(e) => setFileSize(e.target.value)}
                      />
                    </label>
                  </div>
                </>
              )}

              <label className="text-sm">
                Kategori Berkas
                <select
                  className="form-control mt-1"
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                >
                  <option value="LPJ">LPJ (Laporan Pertanggungjawaban)</option>
                  <option value="PROPOSAL">Proposal Kegiatan</option>
                  <option value="SK">Surat Keputusan (SK)</option>
                  <option value="AD_ART">AD / ART Organisasi</option>
                  <option value="LAPORAN">Laporan Akademik / Keuangan</option>
                  <option value="ARSIP">Arsip Organisasi Umum</option>
                </select>
              </label>

              <label className="flex items-center gap-3 text-sm cursor-pointer mt-2">
                <input
                  type="checkbox"
                  className="rounded border-glass-border"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Tampilkan di Halaman Dokumen Publik (`/dokumen`)
              </label>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className={actionClass} disabled={busy}>
                  Batal
                </button>
                <button type="submit" className={`${actionClass} bg-brand`} disabled={busy}>
                  {busy ? "Menyimpan…" : "Simpan Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

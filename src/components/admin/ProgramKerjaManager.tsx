"use client";
import { useEffect, useState } from "react";
import { actionClass, adminApi, errorMessage } from "./api";

type WorkProgram = {
  id: string;
  name: string;
  description: string;
  target_time: string | null;
  success_indicator: string | null;
  progress_notes: string | null;
  status: "BELUM_MULAI" | "BERJALAN" | "SELESAI" | "DITUNDA" | "DIBATALKAN";
  display_order: number;
  department_id: string | null;
  department: { id: string; name: string } | null;
};

type Result = {
  items: WorkProgram[];
  total: number;
  page: number;
  page_size: number;
};

const statusLabels: Record<WorkProgram["status"], string> = {
  BELUM_MULAI: "Belum Mulai",
  BERJALAN: "Sedang Berjalan",
  SELESAI: "Selesai",
  DITUNDA: "Ditunda",
  DIBATALKAN: "Dibatalkan",
};

const statusColors: Record<WorkProgram["status"], string> = {
  BELUM_MULAI: "bg-blue-500/20 text-blue-300",
  BERJALAN: "bg-yellow-500/20 text-yellow-300",
  SELESAI: "bg-green-500/20 text-green-300",
  DITUNDA: "bg-orange-500/20 text-orange-300",
  DIBATALKAN: "bg-red-500/20 text-red-300",
};

export function ProgramKerjaManager() {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkProgram | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetTime, setFormTargetTime] = useState("");
  const [formIndicator, setFormIndicator] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<WorkProgram["status"]>("BELUM_MULAI");

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q: search,
      ...(status ? { status } : {}),
      page: String(page),
    });

    adminApi<Result>(`/api/admin/work-programs?${params}`)
      .then((res) => { if (live) setData(res); })
      .catch((cause) => { if (live) setError(errorMessage(cause)); })
      .finally(() => { if (live) setLoading(false); });

    return () => { live = false; };
  }, [search, status, page, refresh]);

  function openCreateModal() {
    setEditingItem(null);
    setFormName("");
    setFormDescription("");
    setFormTargetTime("");
    setFormIndicator("");
    setFormNotes("");
    setFormStatus("BELUM_MULAI");
    setIsModalOpen(true);
  }

  function openEditModal(item: WorkProgram) {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormTargetTime(item.target_time || "");
    setFormIndicator(item.success_indicator || "");
    setFormNotes(item.progress_notes || "");
    setFormStatus(item.status);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    const payload = {
      name: formName,
      description: formDescription,
      target_time: formTargetTime || undefined,
      success_indicator: formIndicator || undefined,
      progress_notes: formNotes || undefined,
      status: formStatus,
    };

    try {
      if (editingItem) {
        await adminApi(`/api/admin/work-programs/${editingItem.id}`, "PATCH", payload);
        setNotice(`Program kerja "${formName}" berhasil diperbarui.`);
      } else {
        await adminApi(`/api/admin/work-programs`, "POST", payload);
        setNotice(`Program kerja "${formName}" berhasil dibuat.`);
      }
      setIsModalOpen(false);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: WorkProgram) {
    if (busy || !window.confirm(`Hapus program kerja "${item.name}"?`)) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await adminApi(`/api/admin/work-programs/${item.id}`, "DELETE");
      setNotice(`Program kerja "${item.name}" telah dihapus.`);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleQuickStatusChange(item: WorkProgram, newStatus: WorkProgram["status"]) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await adminApi(`/api/admin/work-programs/${item.id}`, "PATCH", { status: newStatus });
      setNotice(`Status "${item.name}" diubah menjadi ${statusLabels[newStatus]}.`);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <section className="glass rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Manajemen Program Kerja</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola daftar program kerja, target pelaksanaan, dan status capaian organisasi/departemen.
            </p>
          </div>
          <button onClick={openCreateModal} className={`${actionClass} bg-brand`}>
            + Tambah Program Kerja
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
          className="grid items-end gap-3 sm:grid-cols-3 xl:grid-cols-4"
        >
          <label className="text-sm sm:col-span-2">
            Cari Program Kerja
            <input
              className="form-control mt-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nama program atau deskripsi..."
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
              <option value="BELUM_MULAI">Belum Mulai</option>
              <option value="BERJALAN">Sedang Berjalan</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITUNDA">Ditunda</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </label>
          <button className={`${actionClass} bg-brand/50`} disabled={loading}>
            {loading ? "Memuat…" : "Terapkan"}
          </button>
        </form>

        {loading && <p className="mt-6 text-center text-sm text-muted-foreground">Memuat program kerja…</p>}

        {!loading && data && data.items.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {search || status ? "Tidak ada program kerja yang cocok dengan filter." : "Belum ada program kerja."}
            </p>
          </div>
        )}

        {!loading && data && data.items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border text-left font-semibold">
                  <th className="pb-3">Program Kerja</th>
                  <th className="pb-3">Departemen</th>
                  <th className="pb-3">Target Waktu</th>
                  <th className="pb-3">Indikator</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b border-glass-border/50">
                    <td className="py-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                    </td>
                    <td className="py-3">
                      {item.department ? item.department.name : <span className="text-muted-foreground">Unggulan BEM</span>}
                    </td>
                    <td className="py-3 text-muted-foreground">{item.target_time || "-"}</td>
                    <td className="py-3 text-muted-foreground max-w-xs truncate">{item.success_indicator || "-"}</td>
                    <td className="py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <select
                          className="text-xs bg-transparent border border-glass-border rounded-lg px-2 py-1"
                          value={item.status}
                          onChange={(e) => handleQuickStatusChange(item, e.target.value as any)}
                          disabled={busy}
                        >
                          <option value="BELUM_MULAI">Belum Mulai</option>
                          <option value="BERJALAN">Berjalan</option>
                          <option value="SELESAI">Selesai</option>
                          <option value="DITUNDA">Ditunda</option>
                          <option value="DIBATALKAN">Dibatalkan</option>
                        </select>
                        <button onClick={() => openEditModal(item)} className="text-accent hover:underline text-xs" disabled={busy}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item)} className="text-soft hover:underline text-xs" disabled={busy}>
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
            <h3 className="text-lg font-semibold">{editingItem ? "Edit Program Kerja" : "Tambah Program Kerja"}</h3>
            <form onSubmit={handleSave} className="mt-4 grid gap-3">
              <label className="text-sm">
                Nama Program Kerja *
                <input
                  className="form-control mt-1"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Misal: FKIP Digital Fest 2026"
                />
              </label>
              <label className="text-sm">
                Deskripsi Singkat *
                <textarea
                  className="form-control mt-1 h-20"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Deskripsi tujuan dan cakupan program..."
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  Target Waktu Execution
                  <input
                    className="form-control mt-1"
                    value={formTargetTime}
                    onChange={(e) => setFormTargetTime(e.target.value)}
                    placeholder="Misal: Triwulan II 2026"
                  />
                </label>
                <label className="text-sm">
                  Status Capaian
                  <select
                    className="form-control mt-1"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                  >
                    <option value="BELUM_MULAI">Belum Mulai</option>
                    <option value="BERJALAN">Sedang Berjalan</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DITUNDA">Ditunda</option>
                    <option value="DIBATALKAN">Dibatalkan</option>
                  </select>
                </label>
              </div>
              <label className="text-sm">
                Indikator Keberhasilan
                <input
                  className="form-control mt-1"
                  value={formIndicator}
                  onChange={(e) => setFormIndicator(e.target.value)}
                  placeholder="Misal: 500+ peserta dari 5 prodi"
                />
              </label>
              <label className="text-sm">
                Catatan Kemajuan / Evaluasi
                <textarea
                  className="form-control mt-1 h-16"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan update pelaksanaan..."
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={actionClass}
                  disabled={busy}
                >
                  Batal
                </button>
                <button type="submit" className={`${actionClass} bg-brand`} disabled={busy}>
                  {busy ? "Menyimpan…" : "Simpan Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { actionClass, adminApi, errorMessage } from "./api";
import { ImageUploader } from "@/components/ImageUploader";

type EventItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  poster_url: string | null;
  start_time: string;
  end_time: string | null;
  registration_deadline: string | null;
  max_participants: number | null;
  status: "DRAF" | "TERBIT" | "BERJALAN" | "SELESAI" | "DIBATALKAN" | "DIARSIPKAN";
  registration_status: "SEGERA_DIBUKA" | "TERBUKA" | "PENUH" | "TUTUP";
  department: { id: string; name: string } | null;
  creator: { id: string; name: string } | null;
  _count: { event_registrations_event: number };
};

type Registration = {
  id: string;
  status: "MENUNGGU" | "DITERIMA" | "DITOLAK" | "HADIR" | "TIDAK_HADIR";
  decision_note: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    nim: string | null;
    angkatan: number | null;
    study_program: { name: string } | null;
  };
};

type Result = {
  items: EventItem[];
  total: number;
  page: number;
  page_size: number;
};

const statusLabels: Record<EventItem["status"], string> = {
  DRAF: "Draf",
  TERBIT: "Terbit",
  BERJALAN: "Sedang Berlangsung",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
  DIARSIPKAN: "Diarsipkan",
};

const regStatusLabels: Record<EventItem["registration_status"], string> = {
  SEGERA_DIBUKA: "Segera Dibuka",
  TERBUKA: "Pendaftaran Terbuka",
  PENUH: "Kuota Penuh",
  TUTUP: "Pendaftaran Ditutup",
};

const regParticipantColors: Record<Registration["status"], string> = {
  MENUNGGU: "bg-yellow-500/20 text-yellow-300",
  DITERIMA: "bg-green-500/20 text-green-300",
  DITOLAK: "bg-red-500/20 text-red-300",
  HADIR: "bg-blue-500/20 text-blue-300",
  TIDAK_HADIR: "bg-gray-500/20 text-gray-300",
};

export function KegiatanManager() {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [regStatus, setRegStatus] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);

  // Event Form Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [regDeadline, setRegDeadline] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [eventStatusVal, setEventStatusVal] = useState<EventItem["status"]>("TERBIT");
  const [regStatusVal, setRegStatusVal] = useState<EventItem["registration_status"]>("TERBUKA");

  // Participant Management Modal
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q: search,
      ...(status ? { status } : {}),
      ...(regStatus ? { registration_status: regStatus } : {}),
      page: String(page),
    });

    adminApi<Result>(`/api/admin/events?${params}`)
      .then((res) => { if (live) setData(res); })
      .catch((cause) => { if (live) setError(errorMessage(cause)); })
      .finally(() => { if (live) setLoading(false); });

    return () => { live = false; };
  }, [search, status, regStatus, page, refresh]);

  function openCreateModal() {
    setEditingEvent(null);
    setName("");
    setDescription("");
    setLocation("");
    const nowISO = new Date().toISOString().slice(0, 16);
    setStartTime(nowISO);
    setEndTime("");
    setRegDeadline("");
    setMaxParticipants("");
    setPosterUrl("");
    setEventStatusVal("TERBIT");
    setRegStatusVal("TERBUKA");
    setIsEventModalOpen(true);
  }

  function openEditModal(event: EventItem) {
    setEditingEvent(event);
    setName(event.name);
    setDescription(event.description);
    setLocation(event.location);
    setStartTime(new Date(event.start_time).toISOString().slice(0, 16));
    setEndTime(event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : "");
    setRegDeadline(event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : "");
    setMaxParticipants(event.max_participants ? String(event.max_participants) : "");
    setPosterUrl(event.poster_url || "");
    setEventStatusVal(event.status);
    setRegStatusVal(event.registration_status);
    setIsEventModalOpen(true);
  }

  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    const payload = {
      name,
      description,
      location,
      start_time: startTime,
      end_time: endTime || undefined,
      registration_deadline: regDeadline || undefined,
      max_participants: maxParticipants ? Number(maxParticipants) : undefined,
      poster_url: posterUrl || undefined,
      status: eventStatusVal,
      registration_status: regStatusVal,
    };

    try {
      if (editingEvent) {
        await adminApi(`/api/admin/events/${editingEvent.id}`, "PATCH", payload);
        setNotice(`Kegiatan "${name}" berhasil diperbarui.`);
      } else {
        await adminApi(`/api/admin/events`, "POST", payload);
        setNotice(`Kegiatan "${name}" berhasil dibuat.`);
      }
      setIsEventModalOpen(false);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteEvent(event: EventItem) {
    if (busy || !window.confirm(`Hapus kegiatan "${event.name}"?`)) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await adminApi(`/api/admin/events/${event.id}`, "DELETE");
      setNotice(`Kegiatan "${event.name}" telah dihapus.`);
      setRefresh((r) => r + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function openParticipantsModal(event: EventItem) {
    setSelectedEvent(event);
    setLoadingRegs(true);
    try {
      const res = await adminApi<{ items: Registration[] }>(`/api/admin/events/${event.id}/registrations`);
      setRegistrations(res.items || []);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoadingRegs(false);
    }
  }

  async function handleUpdateParticipantStatus(registrationId: string, newStatus: Registration["status"]) {
    if (!selectedEvent || busy) return;
    setBusy(true);
    try {
      await adminApi(`/api/admin/events/${selectedEvent.id}/registrations`, "PATCH", {
        registration_id: registrationId,
        status: newStatus,
      });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === registrationId ? { ...r, status: newStatus } : r))
      );
      setNotice("Status peserta berhasil diperbarui.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  function handleExportCSV() {
    if (!selectedEvent || registrations.length === 0) return;
    const headers = "NIM,Nama,Email,Program Studi,Status Pendaftaran,Waktu Daftar\n";
    const rows = registrations
      .map(
        (r) =>
          `"${r.user.nim || "-"}","${r.user.name}","${r.user.email}","${r.user.study_program?.name || "-"}","${r.status}","${r.created_at}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Peserta_${selectedEvent.name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <h2 className="text-xl font-semibold">Manajemen Kegiatan & Peserta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola acara BEM/Departemen, kuota peserta, status pendaftaran, dan data kehadiran.
            </p>
          </div>
          <button onClick={openCreateModal} className={`${actionClass} bg-brand`}>
            + Buat Kegiatan Baru
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
            Cari Kegiatan
            <input
              className="form-control mt-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nama acara atau lokasi..."
            />
          </label>
          <label className="text-sm">
            Status Acara
            <select
              className="form-control mt-2"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">Semua Status Acara</option>
              <option value="DRAF">Draf</option>
              <option value="TERBIT">Terbit</option>
              <option value="BERJALAN">Sedang Berlangsung</option>
              <option value="SELESAI">Selesai</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </label>
          <label className="text-sm">
            Status Pendaftaran
            <select
              className="form-control mt-2"
              value={regStatus}
              onChange={(e) => { setRegStatus(e.target.value); setPage(1); }}
            >
              <option value="">Semua Status Pendaftaran</option>
              <option value="SEGERA_DIBUKA">Segera Dibuka</option>
              <option value="TERBUKA">Pendaftaran Terbuka</option>
              <option value="PENUH">Kuota Penuh</option>
              <option value="TUTUP">Tutup</option>
            </select>
          </label>
          <button className={`${actionClass} bg-brand/50`} disabled={loading}>
            {loading ? "Memuat…" : "Terapkan"}
          </button>
        </form>

        {loading && <p className="mt-6 text-center text-sm text-muted-foreground">Memuat kegiatan…</p>}

        {!loading && data && data.items.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {search || status || regStatus ? "Tidak ada kegiatan yang sesuai filter." : "Belum ada kegiatan."}
            </p>
          </div>
        )}

        {!loading && data && data.items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border text-left font-semibold">
                  <th className="pb-3">Kegiatan & Lokasi</th>
                  <th className="pb-3">Departemen</th>
                  <th className="pb-3">Waktu Pelaksanaan</th>
                  <th className="pb-3">Pendaftar / Kuota</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b border-glass-border/50">
                    <td className="py-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">📍 {item.location}</p>
                    </td>
                    <td className="py-3 text-xs">
                      {item.department ? item.department.name : <span className="text-muted-foreground">BEM</span>}
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">{formatDate(item.start_time)}</td>
                    <td className="py-3 text-xs font-semibold">
                      {item._count.event_registrations_event} / {item.max_participants ? item.max_participants : "∞"}
                    </td>
                    <td className="py-3 text-xs">
                      <span className="block text-accent font-medium">{statusLabels[item.status]}</span>
                      <span className="block text-muted-foreground text-[11px]">{regStatusLabels[item.registration_status]}</span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={() => openParticipantsModal(item)}
                          className={`${actionClass} py-1 text-xs bg-brand/30`}
                        >
                          Peserta ({item._count.event_registrations_event})
                        </button>
                        <button onClick={() => openEditModal(item)} className="text-accent hover:underline text-xs" disabled={busy}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteEvent(item)} className="text-soft hover:underline text-xs" disabled={busy}>
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

      {/* Event Create / Edit Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass rounded-3xl p-6 w-full max-w-xl shadow-2xl my-8">
            <h3 className="text-lg font-semibold">{editingEvent ? "Edit Kegiatan" : "Buat Kegiatan Baru"}</h3>
            <form onSubmit={handleSaveEvent} className="mt-4 grid gap-3">
              <label className="text-sm">
                Nama Kegiatan *
                <input
                  className="form-control mt-1"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Seminar Nasional Education 4.0"
                />
              </label>
              <label className="text-sm">
                Lokasi / Venue *
                <input
                  className="form-control mt-1"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Misal: Aula KH. Sholeh Iskandar UIKA"
                />
              </label>
              <label className="text-sm">
                Deskripsi Kegiatan *
                <textarea
                  className="form-control mt-1 h-24"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi acara, pembicara, fasilitas, dll..."
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  Waktu Mulai *
                  <input
                    type="datetime-local"
                    className="form-control mt-1"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  Waktu Selesai
                  <input
                    type="datetime-local"
                    className="form-control mt-1"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  Batas Pendaftaran
                  <input
                    type="datetime-local"
                    className="form-control mt-1"
                    value={regDeadline}
                    onChange={(e) => setRegDeadline(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  Maksimal Peserta (Kuota)
                  <input
                    type="number"
                    min={1}
                    className="form-control mt-1"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    placeholder="Kosongkan jika tidak terbatas"
                  />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  Status Acara
                  <select className="form-control mt-1" value={eventStatusVal} onChange={(e) => setEventStatusVal(e.target.value as any)}>
                    <option value="DRAF">Draf</option>
                    <option value="TERBIT">Terbit</option>
                    <option value="BERJALAN">Sedang Berlangsung</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DIBATALKAN">Dibatalkan</option>
                  </select>
                </label>
                <label className="text-sm">
                  Status Pendaftaran
                  <select className="form-control mt-1" value={regStatusVal} onChange={(e) => setRegStatusVal(e.target.value as any)}>
                    <option value="SEGERA_DIBUKA">Segera Dibuka</option>
                    <option value="TERBUKA">Pendaftaran Terbuka</option>
                    <option value="PENUH">Kuota Penuh</option>
                    <option value="TUTUP">Tutup</option>
                  </select>
                </label>
              </div>
              <ImageUploader
                label="Poster / Banner Kegiatan"
                value={posterUrl}
                onChange={(url) => setPosterUrl(url)}
              />

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className={actionClass} disabled={busy}>
                  Batal
                </button>
                <button type="submit" className={`${actionClass} bg-brand`} disabled={busy}>
                  {busy ? "Menyimpan…" : "Simpan Kegiatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Management Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass rounded-3xl p-6 w-full max-w-3xl shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-glass-border pb-4">
              <div>
                <h3 className="text-lg font-semibold">Peserta: {selectedEvent.name}</h3>
                <p className="text-xs text-muted-foreground">Total Pendaftar: {registrations.length} mahasiswa</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleExportCSV} className={`${actionClass} py-1 text-xs bg-brand`}>
                  📥 Ekspor CSV
                </button>
                <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-white ml-2">✕</button>
              </div>
            </div>

            {loadingRegs && <p className="mt-6 text-center text-sm text-muted-foreground">Memuat daftar peserta…</p>}

            {!loadingRegs && registrations.length === 0 && (
              <p className="mt-6 text-center text-sm text-muted-foreground">Belum ada peserta yang mendaftar kegiatan ini.</p>
            )}

            {!loadingRegs && registrations.length > 0 && (
              <div className="mt-4 overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-glass-border text-left font-semibold">
                      <th className="pb-3">Mahasiswa</th>
                      <th className="pb-3">NIM / Prodi</th>
                      <th className="pb-3">Waktu Daftar</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Ubah Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="border-b border-glass-border/50">
                        <td className="py-3 font-medium">
                          <p>{reg.user.name}</p>
                          <p className="text-xs text-muted-foreground">{reg.user.email}</p>
                        </td>
                        <td className="py-3 text-xs">
                          <p>{reg.user.nim || "-"}</p>
                          <p className="text-muted-foreground">{reg.user.study_program?.name || "-"}</p>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{formatDate(reg.created_at)}</td>
                        <td className="py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${regParticipantColors[reg.status]}`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            className="text-xs bg-transparent border border-glass-border rounded-lg px-2 py-1"
                            value={reg.status}
                            onChange={(e) => handleUpdateParticipantStatus(reg.id, e.target.value as any)}
                            disabled={busy}
                          >
                            <option value="MENUNGGU">MENUNGGU</option>
                            <option value="DITERIMA">DITERIMA</option>
                            <option value="DITOLAK">DITOLAK</option>
                            <option value="HADIR">HADIR</option>
                            <option value="TIDAK_HADIR">TIDAK HADIR</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

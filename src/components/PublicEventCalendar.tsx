"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Filter } from "lucide-react";

export type EventItem = {
  id: string; name: string; slug: string | null; description: string;
  location: string; poster_url: string | null; start_time: Date | string;
  end_time: Date | string | null; registration_deadline: Date | string | null;
  max_participants: number | null; registration_status: string; status: string;
  department: { name: string } | null;
};

const dateKey = (value: Date | string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));

const dateLabel = (key: string) =>
  new Date(key + "T12:00:00+07:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
  });

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const regLabel: Record<string, string> = {
  TERBUKA: "Pendaftaran Terbuka",
  PENUH: "Kuota Penuh",
  TUTUP: "Pendaftaran Ditutup",
  SEGERA_DIBUKA: "Segera Dibuka",
};

export function PublicEventCalendar({ events = [], today = dateKey(new Date()) }: { events: EventItem[]; today?: string }) {
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [department, setDepartment] = useState("");

  const departments = useMemo(
    () => [...new Set(events.map((e) => e.department?.name || "BEM FKIP UIKA"))].sort(),
    [events]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    events
      .filter((e) => !department || (e.department?.name || "BEM FKIP UIKA") === department)
      .forEach((e) => {
        const key = dateKey(e.start_time);
        map.set(key, [...(map.get(key) || []), e]);
      });
    return map;
  }, [events, department]);

  const [year, monthNum] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthNum - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1;
    return day > 0 && day <= count ? `${month}-${String(day).padStart(2, "0")}` : null;
  });

  const changeMonth = (delta: number) =>
    setMonth((v) => {
      const [y, m] = v.split("-").map(Number);
      return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
    });

  const selectDate = (key: string) => { setSelected(key); setMonth(key.slice(0, 7)); };
  const activeEvents = byDate.get(selected) || [];
  const nextDate = [...byDate.keys()].filter((k) => k > selected).sort()[0];

  return (
    <div className="space-y-6">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" /> Penyelenggara:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {["", ...departments].map((dept) => (
            <button
              key={dept || "__all__"}
              type="button"
              onClick={() => setDepartment(dept)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                department === dept
                  ? "bg-[#E11D74] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {dept || "Semua"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => selectDate(today)}
          className="ml-auto text-xs rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors shrink-0"
        >
          Hari Ini
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Calendar */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {MONTH_NAMES[monthNum - 1]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Bulan sebelumnya"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Bulan berikutnya"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d) => <span key={d}>{d}</span>)}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((key, i) =>
              key ? (
                <button
                  key={key}
                  type="button"
                  data-date={key}
                  onClick={() => selectDate(key)}
                  aria-pressed={key === selected}
                  aria-label={`${dateLabel(key)}, ${byDate.get(key)?.length || 0} kegiatan`}
                  className={`relative h-11 rounded-xl flex flex-col items-center justify-center p-1 transition-colors duration-150 text-sm font-semibold select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 cursor-pointer ${
                    key === selected
                      ? "bg-[#E11D74] text-white shadow-md shadow-pink-500/25"
                      : byDate.has(key)
                      ? "bg-pink-50 text-[#BE185D] hover:bg-pink-100 border border-pink-200/70 font-bold"
                      : "text-slate-700 hover:bg-slate-100 bg-white"
                  }`}
                >
                  <span>{Number(key.slice(-2))}</span>
                  {byDate.has(key) && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${key === selected ? "bg-white" : "bg-[#E11D74]"}`} />
                  )}
                </button>
              ) : (
                <span key={`blank-${i}`} className="h-11 rounded-xl bg-slate-50/50" />
              )
            )}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E11D74]" />
              <span>Ada Agenda</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E11D74] ring-2 ring-pink-300" />
              <span>Dipilih</span>
            </div>
            <span className="text-[11px] text-slate-400">Total {events.length} kegiatan</span>
          </div>
        </div>

        {/* RIGHT: Event detail panel */}
        <div className="lg:col-span-6 space-y-4">
          {/* Date header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-slate-500 font-medium">Agenda pada tanggal:</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{dateLabel(selected)}</h3>
            </div>
            <span className={`rounded-md px-3 py-1 text-xs font-bold ${activeEvents.length > 0 ? "bg-pink-50 text-[#BE185D] border border-pink-200" : "bg-slate-100 text-slate-500"}`}>
              {activeEvents.length} Kegiatan
            </span>
          </div>

          {/* Events or empty */}
          {activeEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white">
              <CalendarDays className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <h4 className="font-semibold text-slate-900">Belum ada kegiatan pada tanggal ini</h4>
              <p className="mt-1 text-xs text-slate-500">Pilih tanggal bertanda titik pink untuk melihat agenda.</p>
              {nextDate && (
                <button type="button" onClick={() => selectDate(nextDate)}
                  className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors">
                  Ke Agenda Berikutnya
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activeEvents.map((event) => (
                <article key={event.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-pink-300 transition-colors duration-200">
                  {event.poster_url && (
                    <div className="relative h-48 w-full bg-slate-100">
                      <img src={event.poster_url} alt={event.name} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute top-3 left-3">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${event.registration_status === "TERBUKA" ? "bg-emerald-100 text-emerald-700" : "bg-pink-100 text-[#BE185D]"}`}>
                          {regLabel[event.registration_status] || event.registration_status}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    {event.department && (
                      <p className="text-xs font-semibold text-[#BE185D]">{event.department.name}</p>
                    )}
                    <h4 className="text-lg font-extrabold text-slate-900 leading-tight">
                      <Link href={`/kegiatan/${event.slug || event.id}`} className="hover:text-[#E11D74] transition-colors">
                        {event.name}
                      </Link>
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{event.description}</p>
                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#E11D74] shrink-0" />
                        <span>{new Date(event.start_time).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" })} WIB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#E11D74] shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/kegiatan/${event.slug || event.id}`}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors">
                        Detail Kegiatan
                      </Link>
                      {event.registration_status === "TERBUKA" && (
                        <Link href={`/kegiatan/${event.slug || event.id}/daftar`}
                          className="rounded-lg bg-[#E11D74] px-4 py-2 text-xs font-medium text-white hover:bg-[#BE185D] transition-colors">
                          Daftar Sekarang
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

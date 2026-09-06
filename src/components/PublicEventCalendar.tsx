"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

export type EventItem = {
  id: string;
  name: string;
  slug: string | null;
  description: string;
  location: string;
  poster_url: string | null;
  start_time: Date | string;
  end_time: Date | string | null;
  registration_deadline: Date | string | null;
  max_participants: number | null;
  registration_status: string;
  status: string;
  department: { name: string } | null;
};

// Helper: Extract YYYY-MM-DD in Asia/Jakarta (WIB)
function getWibDateKey(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // Format: YYYY-MM-DD
}

// Helper: Format header date string in Indonesian (e.g., "Sabtu, 26 September 2026")
function formatIndonesianDateStr(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PublicEventCalendar({ events = [] }: { events: EventItem[] }) {
  // 1. Group events by WIB Date Key
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    for (const ev of events) {
      const key = getWibDateKey(ev.start_time);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  // 2. Initial Condition Setup
  const { initialYear, initialMonthIndex, initialLockedDateKey } = useMemo(() => {
    const todayKey = getWibDateKey(new Date());

    // Priority: closest upcoming event (start_time >= today)
    const sortedUpcoming = [...events]
      .filter((ev) => getWibDateKey(ev.start_time) >= todayKey)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const targetEvent = sortedUpcoming[0] || events[0] || null;
    const targetDateKey = targetEvent ? getWibDateKey(targetEvent.start_time) : todayKey;

    const [y, m] = targetDateKey.split("-").map(Number);
    return {
      initialYear: y,
      initialMonthIndex: m - 1, // 0-indexed
      initialLockedDateKey: targetDateKey,
    };
  }, [events]);

  // State
  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialMonthIndex);
  const [lockedDateKey, setLockedDateKey] = useState<string>(initialLockedDateKey);
  const [hoverDateKey, setHoverDateKey] = useState<string | null>(null);

  const eventPanelRef = useRef<HTMLDivElement>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonthIndex(11);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonthIndex(0);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  // Header month text
  const monthHeaderLabel = new Date(
    Date.UTC(currentYear, currentMonthIndex, 1, 12, 0, 0)
  ).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  // Calculate 35/42 Grid Cells (Mon-Sun starting Monday)
  const calendarGridCells = useMemo(() => {
    const cells = [];
    const firstDayOfMonth = new Date(Date.UTC(currentYear, currentMonthIndex, 1, 12, 0, 0));
    // Day of week: Sunday = 0, Monday = 1... -> Monday = 0 index
    const firstDayOfWeekIndex = (firstDayOfMonth.getUTCDay() + 6) % 7;

    const daysInMonth = new Date(
      Date.UTC(currentYear, currentMonthIndex + 1, 0, 12, 0, 0)
    ).getUTCDate();
    const daysInPrevMonth = new Date(
      Date.UTC(currentYear, currentMonthIndex, 0, 12, 0, 0)
    ).getUTCDate();

    // Trailing days from previous month
    for (let i = firstDayOfWeekIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonthIdx = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
      const prevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
      const monthStr = String(prevMonthIdx + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const dateKey = `${prevYear}-${monthStr}-${dayStr}`;
      cells.push({
        dateKey,
        dayNumber: day,
        isCurrentMonth: false,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Days in current month
    const currMonthStr = String(currentMonthIndex + 1).padStart(2, "0");
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, "0");
      const dateKey = `${currentYear}-${currMonthStr}-${dayStr}`;
      cells.push({
        dateKey,
        dayNumber: day,
        isCurrentMonth: true,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Leading days for next month
    const totalNeeded = cells.length > 35 ? 42 : 35;
    const needNextDays = totalNeeded - cells.length;

    const nextMonthIdx = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
    const nextYear = currentMonthIndex === 11 ? currentYear + 1 : currentYear;
    const nextMonthStr = String(nextMonthIdx + 1).padStart(2, "0");

    for (let day = 1; day <= needNextDays; day++) {
      const dayStr = String(day).padStart(2, "0");
      const dateKey = `${nextYear}-${nextMonthStr}-${dayStr}`;
      cells.push({
        dateKey,
        dayNumber: day,
        isCurrentMonth: false,
        events: eventsByDate[dateKey] || [],
      });
    }

    return cells;
  }, [currentYear, currentMonthIndex, eventsByDate]);

  // Active date logic
  const activeDateKey = hoverDateKey || lockedDateKey;
  const activeEvents = eventsByDate[activeDateKey] || [];
  const todayKey = getWibDateKey(new Date());

  // Date selection handler
  const handleSelectDate = (dateKey: string, cellEvents: EventItem[]) => {
    setLockedDateKey(dateKey);
    setHoverDateKey(null);

    // Scroll to event panel on mobile if below viewport
    if (cellEvents.length > 0 && typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        eventPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  };

  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* LEFT COLUMN: Calendar Card (~40-45% width on desktop -> lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="glass rounded-3xl p-5 sm:p-6 shadow-xl border border-glass-border space-y-5">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between border-b border-glass-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-white capitalize">{monthHeaderLabel}</h3>
              <p className="text-xs text-muted-foreground">Pilih tanggal untuk melihat agenda acara</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Bulan Sebelumnya"
                className="focus-ring flex size-9 items-center justify-center rounded-xl bg-white/5 border border-glass-border text-white hover:bg-brand/30 hover:border-accent/40 transition"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Bulan Berikutnya"
                className="focus-ring flex size-9 items-center justify-center rounded-xl bg-white/5 border border-glass-border text-white hover:bg-brand/30 hover:border-accent/40 transition"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div onMouseLeave={() => setHoverDateKey(null)}>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {dayNames.map((d) => (
                <span key={d} className="text-xs font-bold text-accent uppercase tracking-wider py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Date Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarGridCells.map((cell) => {
                const { dateKey, dayNumber, isCurrentMonth, events: cellEvents } = cell;
                const hasEvents = cellEvents.length > 0;
                const isLocked = dateKey === lockedDateKey;
                const isHovered = dateKey === hoverDateKey;
                const isToday = dateKey === todayKey;

                let cellStyle = "bg-white/5 text-muted-foreground/60 hover:bg-white/10 hover:text-white";

                if (isCurrentMonth) {
                  if (hasEvents) {
                    cellStyle = "bg-brand/20 border border-brand/40 text-white font-bold hover:bg-brand/40 hover:border-accent/60 shadow-xs";
                  } else {
                    cellStyle = "text-white/80 hover:bg-white/10 hover:text-white";
                  }
                } else {
                  cellStyle = "text-muted-foreground/30 hover:bg-white/5";
                }

                if (isLocked) {
                  cellStyle = "bg-brand/50 border-2 border-accent text-white font-extrabold shadow-[0_0_15px_rgba(236,72,153,0.35)] scale-105 z-10";
                } else if (isHovered) {
                  cellStyle = "bg-white/20 border border-white/30 text-white font-bold";
                }

                return (
                  <button
                    key={dateKey}
                    type="button"
                    tabIndex={0}
                    onClick={() => handleSelectDate(dateKey, cellEvents)}
                    onMouseEnter={() => hasEvents && setHoverDateKey(dateKey)}
                    onFocus={() => hasEvents && setHoverDateKey(dateKey)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectDate(dateKey, cellEvents);
                      }
                    }}
                    className={`relative aspect-square flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-2xl transition-all duration-200 select-none ${cellStyle}`}
                  >
                    <span className={`text-xs sm:text-sm font-semibold ${isToday ? "underline underline-offset-4 decoration-accent font-extrabold" : ""}`}>
                      {dayNumber}
                    </span>

                    {/* Indicator for Events */}
                    {hasEvents && (
                      <div className="flex items-center justify-center gap-1 w-full pb-0.5">
                        {cellEvents.length === 1 ? (
                          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                        ) : (
                          <span className="text-[9px] sm:text-[10px] font-extrabold bg-accent text-white px-1.5 py-0.2 rounded-full shadow-xs">
                            +{cellEvents.length}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend Footer */}
          <div className="pt-3 border-t border-glass-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent" /> Tanggal Ada Kegiatan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border border-accent bg-brand/40" /> Tanggal Terpilih
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Event Panel (~55-60% width on desktop -> lg:col-span-7) */}
      <div ref={eventPanelRef} className="lg:col-span-7 space-y-5">
        <div className="glass rounded-3xl p-5 sm:p-6 border border-glass-border shadow-xl space-y-4">
          {/* Panel Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-glass-border pb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-accent" />
              <h3 className="text-base font-bold text-white">
                {formatIndonesianDateStr(activeDateKey)}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {activeDateKey === todayKey && (
                <span className="text-[10px] bg-accent/20 text-accent border border-accent/30 font-bold px-2.5 py-0.5 rounded-full">
                  Hari Ini
                </span>
              )}
              <span className="text-[10px] bg-white/10 text-muted-foreground font-semibold px-2.5 py-0.5 rounded-full">
                {activeEvents.length} Agenda Kegiatan
              </span>
            </div>
          </div>

          {/* Panel Content Body */}
          {activeEvents.length === 0 ? (
            <div className="glass rounded-3xl p-8 sm:p-12 text-center border-glass-border space-y-3">
              <div className="mx-auto size-12 rounded-2xl bg-white/5 border border-glass-border flex items-center justify-center text-muted-foreground">
                <CalendarIcon className="size-6 text-accent/60" />
              </div>
              <h4 className="text-base font-bold text-white">Tidak ada kegiatan pada tanggal ini</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Pilih tanggal yang memiliki tanda indikator warna pink di kalender untuk melihat detail agenda acara BEM FKIP UIKA.
              </p>
            </div>
          ) : (
            <div className="space-y-5 max-h-[750px] overflow-y-auto pr-1">
              {activeEvents.map((ev) => {
                const eventSlugOrId = ev.slug || ev.id;
                const isOpen = ev.registration_status === "TERBUKA";

                const startTimeStr = new Date(ev.start_time).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                });
                const endTimeStr = ev.end_time
                  ? new Date(ev.end_time).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    })
                  : null;

                return (
                  <div
                    key={ev.id}
                    className="glass rounded-3xl overflow-hidden border border-glass-border hover:border-accent/40 transition shadow-xl flex flex-col justify-between"
                  >
                    {/* Poster Banner */}
                    {ev.poster_url ? (
                      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-black/40 border-b border-glass-border">
                        <img
                          src={ev.poster_url}
                          alt={ev.name}
                          className="w-full h-full object-cover brightness-95 transition duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span
                          className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-md ${
                            isOpen
                              ? "bg-green-500/80 text-white border border-green-400/40"
                              : "bg-yellow-500/80 text-white border border-yellow-400/40"
                          }`}
                        >
                          {isOpen ? "Pendaftaran Terbuka" : "Segera Dibuka"}
                        </span>
                        {ev.department?.name && (
                          <span className="absolute bottom-3 left-4 rounded-full bg-accent/90 text-white text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider backdrop-blur-md">
                            {ev.department.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-24 w-full overflow-hidden bg-gradient-to-br from-brand/30 via-purple-900/20 to-black/60 p-4 flex items-end justify-between border-b border-glass-border">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            isOpen
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                          }`}
                        >
                          {isOpen ? "Pendaftaran Terbuka" : "Segera Dibuka"}
                        </span>
                        {ev.department?.name && (
                          <span className="rounded-full bg-accent/20 text-accent text-[10px] font-semibold px-2.5 py-0.5 border border-accent/30">
                            {ev.department.name}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-accent font-semibold mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5 shrink-0" /> {startTimeStr} {endTimeStr ? `s.d. ${endTimeStr}` : ""} WIB
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white hover:text-accent transition">
                          <Link href={`/kegiatan/${eventSlugOrId}`}>{ev.name}</Link>
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {ev.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-glass-border space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-4 text-accent shrink-0" /> {ev.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="size-4 text-accent shrink-0" /> Kuota: {ev.max_participants || "Tidak Terbatas"}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <Link
                            href={`/kegiatan/${eventSlugOrId}`}
                            className="focus-ring flex-1 text-center rounded-xl border border-glass-border px-3 py-2 text-xs font-semibold text-white hover:border-accent hover:text-accent transition"
                          >
                            Detail Acara
                          </Link>
                          {isOpen && (
                            <Link
                              href={`/kegiatan/${eventSlugOrId}/daftar`}
                              className="focus-ring flex-1 text-center rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-hover transition inline-flex items-center justify-center gap-1 shadow-md"
                            >
                              Daftar Acara <ArrowUpRight className="size-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

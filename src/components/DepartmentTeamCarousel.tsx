"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Award } from "lucide-react";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";

export type DepartmentMemberItem = {
  id: string; name: string; position: string; photo_url: string | null; display_order: number;
};

export function DepartmentTeamCarousel({ members = [], departmentName = "" }: { members: DepartmentMemberItem[]; departmentName?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<DepartmentMemberItem | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const team = useMemo(() => {
    const sorted = [...members].sort((a, b) => a.display_order - b.display_order);
    const head = sorted.find((m) => /kepala|kadep|ketua/i.test(m.position));
    return { head, items: head ? [head, ...sorted.filter((m) => m.id !== head.id)] : sorted };
  }, [members]);

  const updateEdges = () => {
    const el = track.current;
    if (el) setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };

  useEffect(() => {
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, [members]);

  const move = (dir: number) =>
    track.current?.scrollBy({
      left: dir * (track.current.clientWidth * 0.8),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });

  const portrait = (member: DepartmentMemberItem, large = false) =>
    member.photo_url ? (
      <img src={member.photo_url} alt="" loading="lazy"
        className={`${large ? "w-28 h-28" : "w-20 h-20"} mx-auto rounded-2xl object-cover ring-4 ring-pink-100 shadow-sm`} />
    ) : (
      <div className={`${large ? "w-28 h-28 text-2xl" : "w-20 h-20 text-xl"} mx-auto grid place-items-center rounded-2xl bg-pink-50 text-[#BE185D] font-bold ring-4 ring-pink-100`}>
        {member.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
      </div>
    );

  return (
    <section className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Susunan Pengurus Departemen</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Fungsionaris yang menggerakkan program kerja {departmentName}.</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button type="button" aria-label="Geser kiri" disabled={!edges.left} onClick={() => move(-1)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" aria-label="Geser kanan" disabled={!edges.right} onClick={() => move(1)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!team.items.length ? (
        <EmptyState title="Belum ada pengurus yang ditampilkan" description="Profil pengurus akan tersedia setelah dipublikasikan." />
      ) : (
        <div
          ref={track}
          onScroll={updateEdges}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#f9a8d4 transparent" }}
        >
          {team.items.map((member) => {
            const isHead = member.id === team.head?.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelected(member)}
                className={`w-52 sm:w-60 shrink-0 bg-white rounded-2xl border hover:border-pink-300 transition-all duration-150 p-5 flex flex-col justify-between space-y-4 text-left ${
                  isHead ? "border-pink-200 shadow-sm" : "border-slate-200/90 shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  {isHead && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#BE185D] uppercase tracking-wider">Pimpinan Departemen</span>
                      <Award className="w-4 h-4 text-[#E11D74]" />
                    </div>
                  )}
                  {portrait(member, isHead)}
                  <div className="text-center space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{member.name}</h4>
                    <p className="text-xs text-[#BE185D] font-medium line-clamp-1">{member.position}</p>
                  </div>
                </div>
                <span className="block text-right text-xs font-semibold text-[#E11D74] pt-2 border-t border-slate-100">
                  Lihat profil →
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile swipe hint */}
      <p className="text-right text-[11px] text-slate-400 sm:hidden">← Geser untuk melihat anggota lainnya →</p>

      {/* Profile modal */}
      {selected && (
        <Modal label={`Profil ${selected.name}`} onClose={() => setSelected(null)}>
          <div className="mb-4 flex justify-end">
            <button type="button" aria-label="Tutup" onClick={() => setSelected(null)}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          </div>
          {portrait(selected, true)}
          <h3 className="mt-4 text-center text-2xl font-bold text-slate-900">{selected.name}</h3>
          <p className="mt-1 text-center font-medium text-[#BE185D]">{selected.position}</p>
          <p className="mt-1 text-center text-sm text-slate-500">{departmentName}</p>
          <button type="button" onClick={() => setSelected(null)}
            className="mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors">
            Tutup Profil
          </button>
        </Modal>
      )}
    </section>
  );
}

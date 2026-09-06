"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, UserCircle, X, ShieldCheck, Sparkles } from "lucide-react";

export type DepartmentMemberItem = {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  display_order: number;
};

export function DepartmentTeamCarousel({
  members = [],
  departmentName = "",
}: {
  members: DepartmentMemberItem[];
  departmentName?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DepartmentMemberItem | null>(null);

  // 1. Separate Head of Department from Staff Members
  const headMember = members.find(
    (m) =>
      m.position.toLowerCase().includes("kepala") ||
      m.position.toLowerCase().includes("kadep") ||
      m.position.toLowerCase().includes("ketua")
  );

  const staffMembers = members.filter((m) => m.id !== headMember?.id);

  // Combine: Head is ALWAYS 1st card
  const teamList = headMember ? [headMember, ...staffMembers] : staffMembers;

  // 2. Scroll check handler
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [teamList]);

  // ESC key listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedMember(null);
      }
    };
    if (selectedMember) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMember]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (teamList.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 text-center border border-glass-border">
        <div className="mx-auto size-12 rounded-2xl bg-white/5 border border-glass-border flex items-center justify-center text-muted-foreground mb-3">
          <UserCircle className="size-6 text-accent/60" />
        </div>
        <p className="text-sm font-semibold text-white">Belum ada anggota tim yang terdaftar</p>
        <p className="text-xs text-muted-foreground mt-1">
          Daftar anggota pengurus departemen ini akan tampil otomatis di sini setelah diisi oleh pengurus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="size-5 text-accent" /> Tim Departemen
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gesper ke kanan/kiri untuk melihat pengurus dan anggota staff {departmentName}
          </p>
        </div>

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Geser Kiri"
            className="focus-ring flex size-9 items-center justify-center rounded-xl bg-white/5 border border-glass-border text-white hover:bg-brand/30 hover:border-accent/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Geser Kanan"
            className="focus-ring flex size-9 items-center justify-center rounded-xl bg-white/5 border border-glass-border text-white hover:bg-brand/30 hover:border-accent/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 px-0.5 text-left"
        >
          {teamList.map((member) => {
            const isHead = member.id === headMember?.id;

            const initials = member.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`snap-start shrink-0 w-[82vw] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] flex flex-col justify-between glass rounded-3xl p-5 border transition shadow-xl cursor-pointer group ${
                  isHead
                    ? "border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                    : "border-glass-border hover:border-accent/50"
                }`}
              >
                <div className="space-y-4">
                  {/* Portrait Image Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black/40 border border-glass-border">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        className="object-cover object-[center_top] transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 82vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/40 via-purple-900/30 to-black font-black text-3xl text-amber-300">
                        {initials}
                      </div>
                    )}

                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      {isHead ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/90 text-black shadow-md backdrop-blur-md">
                          <ShieldCheck className="size-3" /> Kepala Departemen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/70 text-accent border border-accent/30 backdrop-blur-md">
                          Staff Departemen
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Member Name & Position */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-accent transition line-clamp-1">
                      {member.name}
                    </h3>
                    <p className={`text-xs font-medium mt-0.5 ${isHead ? "text-amber-300 font-semibold" : "text-muted-foreground"}`}>
                      {member.position || (isHead ? "Kepala Departemen" : "Staff")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-glass-border flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember(member);
                    }}
                    className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                  >
                    Lihat Profil &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MEMBER DETAIL MODAL */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="glass rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-accent/40 space-y-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              aria-label="Tutup"
              className="absolute top-4 right-4 text-muted-foreground hover:text-white size-8 rounded-full bg-white/10 flex items-center justify-center transition"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              {/* Photo */}
              <div className="relative aspect-[3/4] w-36 sm:w-40 shrink-0 overflow-hidden rounded-2xl border-2 border-accent/40 shadow-xl bg-black/40">
                {selectedMember.photo_url ? (
                  <Image
                    src={selectedMember.photo_url}
                    alt={selectedMember.name}
                    fill
                    className="object-cover object-[center_top]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand via-purple-900 to-black text-3xl font-black text-amber-300">
                    {selectedMember.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info Details */}
              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                    {selectedMember.id === headMember?.id ? "Kepala Departemen" : "Staff Departemen"}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">{selectedMember.name}</h3>
                  <p className="text-sm font-semibold text-accent mt-0.5">{selectedMember.position}</p>
                  {departmentName && (
                    <p className="text-xs text-muted-foreground mt-0.5">{departmentName}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-glass-border text-xs text-muted-foreground space-y-1.5">
                  <p className="font-semibold text-white">Identitas Pengurus Resmi</p>
                  <p>Anggota tim terverifikasi pada kepengurusan BEM FKIP UIKA Bogor periode aktif.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="focus-ring rounded-xl bg-brand px-5 py-2 text-xs font-semibold text-white hover:bg-brand-hover transition"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

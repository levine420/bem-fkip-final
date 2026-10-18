import Image from "next/image";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { EmptyState } from "@/components/EmptyState";
import { getActiveBoardMembers, getActiveDepartments, getActivePeriod } from "@/server/public/data";
import { Crown, Users } from "lucide-react";

export const revalidate = 60;

function MemberCard({
  bm,
  large = false,
  subLabel,
}: {
  bm: Awaited<ReturnType<typeof getActiveBoardMembers>>[number];
  large?: boolean;
  subLabel?: string;
}) {
  const initials = bm.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 hover:border-pink-300 transition-all duration-200 shadow-xs flex flex-col items-center p-5 text-center ${large ? "py-8" : ""}`}>
      {bm.photo_url ? (
        <div className={`relative shrink-0 overflow-hidden rounded-2xl ring-4 ring-pink-100 shadow-sm mb-4 ${large ? "size-28" : "size-20"}`}>
          <Image unoptimized src={bm.photo_url} alt={bm.name} fill className="object-cover" />
        </div>
      ) : (
        <div className={`flex shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-[#BE185D] font-bold shadow-xs ring-4 ring-pink-100 mb-4 ${large ? "size-28 text-3xl" : "size-20 text-xl"}`}>
          {initials}
        </div>
      )}
      <p className="font-bold text-slate-900 text-sm leading-snug">{bm.name}</p>
      <p className="mt-1 text-xs text-[#BE185D] font-semibold">{bm.position}</p>
      {subLabel && <p className="mt-1 text-[11px] text-slate-400">{subLabel}</p>}
    </div>
  );
}

export default async function StructurePage() {
  const [period, boardMembers, departments] = await Promise.all([
    getActivePeriod(),
    getActiveBoardMembers(),
    getActiveDepartments(),
  ]);

  const pengurusInti = boardMembers.filter((bm) => bm.department_id === null);
  const kepalaDepartemen = boardMembers.filter((bm) => bm.department_id !== null);

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow={period ? `Kabinet ${period.name} · ${period.year_start}–${period.year_end}` : "Organisasi"}
        title="Struktur Kepengurusan BEM FKIP UIKA"
        description="Tata kelola eksekutif terstruktur dari pimpinan harian hingga departemen teknis."
        breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Struktur Kepengurusan" }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {boardMembers.length === 0 ? (
          <EmptyState
            title="Belum ada data pengurus pada periode aktif"
            description="Struktur pengurus ditarik langsung dari database setelah diisi melalui Admin Panel."
          />
        ) : (
          <>
            {/* Pimpinan Utama */}
            {pengurusInti.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Pimpinan Utama</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                  {pengurusInti.slice(0, 2).map((bm) => <MemberCard key={bm.id} bm={bm} large />)}
                </div>
              </section>
            )}

            {/* Sekum & Bendum */}
            {pengurusInti.length > 2 && (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Administrasi & Keuangan</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {pengurusInti.slice(2).map((bm) => <MemberCard key={bm.id} bm={bm} />)}
                </div>
              </section>
            )}

            {/* Kepala Departemen */}
            {kepalaDepartemen.length > 0 && (
              <section className="space-y-6 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#E11D74] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Jajaran Departemen Pelaksana</h2>
                </div>
                <div className="bg-gradient-to-br from-pink-50/60 via-white to-slate-50 rounded-2xl border border-pink-100/80 p-6">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {kepalaDepartemen.map((bm) => {
                      const dept = departments.find((d) => d.id === bm.department_id);
                      return <MemberCard key={bm.id} bm={bm} subLabel={dept?.name} />;
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PublicPageFrame>
  );
}

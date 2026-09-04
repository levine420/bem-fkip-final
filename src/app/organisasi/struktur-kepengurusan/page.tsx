import Image from "next/image";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { EmptyState } from "@/components/EmptyState";
import { getActiveBoardMembers, getActiveDepartments, getActivePeriod } from "@/server/public/data";
import { Crown, Users, UserCircle } from "lucide-react";

export const revalidate = 60;

function MemberCard({ bm, large = false }: { bm: any; large?: boolean }) {
  const initials = bm.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`glass flex flex-col items-center rounded-3xl p-6 text-center shadow-lg transition hover:border-accent/40 hover:shadow-xl ${
        large ? "py-8" : ""
      }`}
    >
      {bm.photo_url ? (
        <div className={`relative shrink-0 overflow-hidden rounded-full border-4 border-amber-500/40 shadow-xl mb-4 ${large ? "size-28" : "size-20"}`}>
          <Image src={bm.photo_url} alt={bm.name} fill className="object-cover" />
        </div>
      ) : (
        <div
          className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 font-display font-black text-black shadow-xl border-4 border-white/10 mb-4 ${
            large ? "size-28 text-3xl" : "size-20 text-xl"
          }`}
        >
          {initials}
        </div>
      )}
      <p className="font-bold text-foreground leading-snug">{bm.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{bm.position}</p>
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

  if (boardMembers.length === 0) {
    return (
      <PublicPageFrame>
        <PublicPageHero
          eyebrow={period ? `Kabinet ${period.name}` : "Organisasi"}
          title="Struktur Kepengurusan"
          description="Susunan pengurus BEM FKIP UIKA pada periode aktif."
          breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Struktur Kepengurusan" }]}
        />
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <EmptyState
              title="Belum ada data pengurus pada periode aktif"
              description="Struktur pengurus ditarik langsung dari database setelah diisi melalui Admin Panel."
            />
          </div>
        </section>
      </PublicPageFrame>
    );
  }

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow={`Kabinet ${period?.name || "Aktif"} · ${period?.year_start || 2026}–${period?.year_end || 2027}`}
        title="Struktur Kepengurusan"
        description={`Susunan pengurus resmi BEM FKIP UIKA Kabinet ${period?.name || "Aktif"}.`}
        breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Struktur Kepengurusan" }]}
      />
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-10">

          <div className="text-center">
            <p className="font-display text-2xl font-extrabold text-foreground">Kabinet {period?.name}</p>
            <p className="text-xs text-muted-foreground">BEM FKIP UIKA {period?.year_start}–{period?.year_end}</p>
          </div>

          {/* Gubernur & Wakil Gubernur / Pimpinan Utama */}
          {pengurusInti.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="grid size-8 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Crown className="size-4" />
                </span>
                <h2 className="font-display text-xl font-bold text-foreground">Pimpinan Utama</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                {pengurusInti.slice(0, 2).map((bm) => (
                  <MemberCard key={bm.id} bm={bm} large />
                ))}
              </div>
            </div>
          )}

          {/* Sekum, Bendum, dll */}
          {pengurusInti.length > 2 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 border-t border-glass-border" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sekretaris & Bendahara</span>
                <div className="flex-1 border-t border-glass-border" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {pengurusInti.slice(2).map((bm) => (
                  <MemberCard key={bm.id} bm={bm} />
                ))}
              </div>
            </div>
          )}

          {/* Kepala Departemen */}
          {kepalaDepartemen.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 border-t border-glass-border" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kepala Departemen</span>
                <div className="flex-1 border-t border-glass-border" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="grid size-8 place-items-center rounded-xl bg-brand/20 text-accent">
                  <Users className="size-4" />
                </span>
                <h2 className="font-display text-xl font-bold text-foreground">Kepala Departemen</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {kepalaDepartemen.map((bm) => {
                  const dept = departments.find((d) => d.id === bm.department_id);
                  return (
                    <div key={bm.id} className="glass flex flex-col items-center rounded-3xl p-5 text-center shadow-md transition hover:border-accent/40">
                      {bm.photo_url ? (
                        <div className="relative size-16 overflow-hidden rounded-full border-2 border-accent/30 shadow mb-3">
                          <Image src={bm.photo_url} alt={bm.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent font-display text-lg font-black text-white shadow border-2 border-white/10 mb-3">
                          {bm.name.charAt(0)}
                        </div>
                      )}
                      <p className="font-bold text-foreground text-sm leading-snug">{bm.name}</p>
                      <p className="mt-1 text-[11px] text-accent font-semibold">{bm.position}</p>
                      {dept && (
                        <p className="mt-1 text-[10px] text-muted-foreground">{dept.name}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-5 flex items-start gap-3">
            <UserCircle className="size-5 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nama dan foto pengurus diperbarui melalui Admin Panel. Data ini secara otomatis akan tampil di halaman publik setelah disimpan.
            </p>
          </div>

        </div>
      </section>
    </PublicPageFrame>
  );
}

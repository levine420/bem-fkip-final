import Image from "next/image";
import Link from "next/link";
import { Users, UserCircle, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { departments, boardMembers } from "@/lib/data/public-data";

// Map departement ID to abbreviation for display
const deptAbbrev: Record<string, string> = {
  "d-sosgam": "SOSGAM",
  "d-minba": "MINBA",
  "d-psdm": "PSDM",
  "d-kominfo": "KOMINFO",
  "d-kastrat": "KASTRAT",
};

const deptColors: Record<string, string> = {
  "d-sosgam": "from-emerald-500 to-teal-400",
  "d-minba": "from-violet-500 to-purple-400",
  "d-psdm": "from-blue-500 to-cyan-400",
  "d-kominfo": "from-pink-500 to-rose-400",
  "d-kastrat": "from-amber-500 to-yellow-400",
};

export default function DepartmentsPage() {
  if (departments.length === 0) {
    return (
      <PublicPageFrame>
        <PublicPageHero
          eyebrow="Organisasi"
          title="Departemen BEM FKIP UIKA"
          description="Daftar departemen periode aktif Kabinet Altiora 2026-2027."
          breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Departemen" }]}
        />
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <EmptyState
              title="Belum ada data departemen pada periode aktif"
              description="Daftar departemen harus berasal dari data organisasi yang telah dikonfirmasi dan dimasukkan melalui Admin."
            />
          </div>
        </section>
      </PublicPageFrame>
    );
  }

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Organisasi · Kabinet Altiora 2026-2027"
        title="Departemen BEM FKIP UIKA"
        description="Lima departemen Kabinet Altiora yang berkolaborasi untuk mewujudkan visi dan misi BEM FKIP UIKA."
        breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Departemen" }]}
      />
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Intro */}
          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              BEM FKIP UIKA Kabinet Altiora 2026-2027 terdiri dari lima departemen yang bergerak secara kolaboratif
              untuk memberikan kebermanfaatan nyata kepada seluruh Keluarga Besar Mahasiswa FKIP UIKA.
            </p>
          </div>

          {/* Department Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const abbrev = deptAbbrev[dept.id] ?? dept.name;
              const colorClass = deptColors[dept.id] ?? "from-brand to-accent";
              // Find head of department from boardMembers
              const kadep = boardMembers.find((bm) => bm.department_id === dept.id);

              return (
                <Link
                  key={dept.id}
                  href={`/organisasi/departemen/${dept.id}`}
                  className="glass group flex flex-col rounded-3xl p-6 shadow-lg transition hover:border-accent/40 hover:shadow-xl"
                >
                  {/* Dept Header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClass} font-display text-[11px] font-black text-black shadow-md transition-transform group-hover:scale-110`}>
                      {abbrev}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground leading-tight group-hover:text-accent transition text-base">
                        {dept.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1">
                    {dept.description}
                  </p>

                  {/* Kadep Section */}
                  <div className="border-t border-glass-border pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-3 flex items-center gap-1.5">
                      <UserCircle className="size-3.5" /> Kepala Departemen
                    </p>
                    <div className="flex items-center gap-3">
                      {/* Photo placeholder - upload via admin */}
                      {kadep?.photo_url ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-accent/30">
                          <Image src={kadep.photo_url} alt={kadep.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} text-black font-bold text-lg shadow`}>
                          {abbrev.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{kadep?.name ?? "—"}</p>
                        <p className="text-[11px] text-muted-foreground">{kadep?.position ?? "Kepala Departemen"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Staff placeholder */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-glass-border bg-white/3 px-3 py-2">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Staff departemen dikelola via Admin Panel</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Foto kepala departemen dan daftar staff dapat diperbarui melalui Admin Panel oleh Super Admin.
            </p>
            <Link href="/organisasi/struktur-kepengurusan" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
              Lihat Struktur Kepengurusan Lengkap <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicPageFrame>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Users, UserCircle, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { getActiveBoardMembers, getActiveDepartments } from "@/server/public/data";

export const revalidate = 60;

export default async function DepartmentsPage() {
  const [departments, boardMembers] = await Promise.all([
    getActiveDepartments(),
    getActiveBoardMembers(),
  ]);

  if (departments.length === 0) {
    return (
      <PublicPageFrame>
        <PublicPageHero
          eyebrow="Organisasi"
          title="Departemen BEM FKIP UIKA"
          description="Daftar departemen periode aktif Kabinet BEM FKIP UIKA."
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
        eyebrow="Organisasi · Periode Aktif"
        title="Departemen BEM FKIP UIKA"
        description="Departemen BEM FKIP UIKA yang berkolaborasi untuk mewujudkan visi dan misi organisasi."
        breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Departemen" }]}
      />
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Intro */}
          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Departemen BEM FKIP UIKA bergerak secara kolaboratif untuk memberikan kebermanfaatan nyata kepada seluruh Keluarga Besar Mahasiswa FKIP UIKA.
            </p>
          </div>

          {/* Department Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const kadep = boardMembers.find((bm) => bm.department_id === dept.id);

              return (
                <Link
                  key={dept.id}
                  href={`/organisasi/departemen/${dept.slug || dept.id}`}
                  className="glass group flex flex-col rounded-3xl p-6 shadow-lg transition hover:border-accent/40 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent font-display text-[11px] font-black text-white shadow-md transition-transform group-hover:scale-110">
                      {dept.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground leading-tight group-hover:text-accent transition text-base">
                        {dept.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1 line-clamp-3">
                    {dept.description}
                  </p>

                  <div className="border-t border-glass-border pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-3 flex items-center gap-1.5">
                      <UserCircle className="size-3.5" /> Kepala Departemen
                    </p>
                    <div className="flex items-center gap-3">
                      {kadep?.photo_url ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-accent/30">
                          <Image src={kadep.photo_url} alt={kadep.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-white font-bold text-lg shadow">
                          {kadep?.name ? kadep.name.charAt(0) : dept.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{kadep?.name ?? "Belum Ditentukan"}</p>
                        <p className="text-[11px] text-muted-foreground">{kadep?.position ?? "Kepala Departemen"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-glass-border bg-white/3 px-3 py-2">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Staff departemen dikelola via Admin Panel</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center space-y-3">
            <Link href="/organisasi/struktur-kepengurusan" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
              Lihat Struktur Kepengurusan Lengkap <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicPageFrame>
  );
}

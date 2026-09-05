import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { getDepartmentBySlug } from "@/server/public/data";

export default async function DepartmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);
  
  if (!department) {
    return (
      <PublicPageFrame>
        <PublicPageHero 
          eyebrow="Departemen"
          title="Departemen Tidak Ditemukan"
          description="Departemen yang Anda cari tidak tersedia."
          breadcrumbs={[
            { label: "Organisasi", href: "/organisasi" }, 
            { label: "Departemen", href: "/organisasi/departemen" }
          ]}
        />
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <p className="text-muted-foreground">Departemen tidak ditemukan.</p>
          </div>
        </section>
      </PublicPageFrame>
    );
  }

  const head = department.department_members_department.find(m => m.position.includes("Kepala"));
  const staff = department.department_members_department.filter(m => !m.position.includes("Kepala"));

  return (
    <PublicPageFrame>
      <PublicPageHero 
        eyebrow="Departemen · Kabinet Altiora 2026-2027"
        title={department.name}
        description={department.description}
        breadcrumbs={[
          { label: "Organisasi", href: "/organisasi" }, 
          { label: "Departemen", href: "/organisasi/departemen" }, 
          { label: department.slug.toUpperCase() }
        ]}
      />

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-12">

          {/* Department Head Spotlight */}
          {head && (
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
                <Users className="size-5 text-accent" />
                Kepala Departemen
              </h2>
              <div className="glass rounded-3xl p-8">
                <div className="flex flex-col gap-8 md:flex-row md:items-start">
                  {/* Photo */}
                  <div className="shrink-0">
                    {head.photo_url ? (
                      <div className="relative size-32 overflow-hidden rounded-2xl border-4 border-accent/30">
                        <Image src={head.photo_url} alt={head.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex size-32 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-4xl font-black text-black shadow-lg">
                        {head.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{head.name}</h3>
                      <p className="text-sm text-accent">{head.position}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Grid */}
          {staff.length > 0 && (
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
                <Users className="size-5 text-accent" />
                Anggota Staff
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {staff.map((member) => (
                  <div key={member.id} className="glass rounded-2xl p-6 flex items-center gap-4">
                    {member.photo_url ? (
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-glass-border">
                        <Image src={member.photo_url} alt={member.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/60 text-lg font-bold text-black">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Foto dan data staff dapat diperbarui melalui Admin Panel oleh Super Admin atau Kepala Departemen.
              </p>
            </div>
          )}

          {/* Link to Program Kerja */}
          <div className="text-center">
            <Link href="/organisasi/program-kerja" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
              Lihat Program Kerja <ChevronRight className="size-4" />
            </Link>
          </div>

        </div>
      </section>
    </PublicPageFrame>
  );
}

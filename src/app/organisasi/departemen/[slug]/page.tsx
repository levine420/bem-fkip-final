import { notFound } from "next/navigation";
import { Clock, Target, CheckCircle2, AlertCircle, Briefcase } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { DepartmentTeamCarousel } from "@/components/DepartmentTeamCarousel";
import { getDepartmentBySlug, getActiveDepartments } from "@/server/public/data";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const departments = await getActiveDepartments();
  return departments
    .filter((d) => d.slug)
    .map((d) => ({ slug: d.slug! }));
}

const statusMapping: Record<string, { label: string; className: string }> = {
  BELUM_MULAI: {
    label: "Akan Datang",
    className: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  },
  BERJALAN: {
    label: "Berlangsung",
    className: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  },
  SELESAI: {
    label: "Selesai",
    className: "bg-green-500/20 text-green-300 border border-green-500/30",
  },
};

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  const periodName = department.period
    ? `Kabinet ${department.period.name} (${department.period.year_start}–${department.period.year_end})`
    : "BEM FKIP UIKA";

  const workPrograms = department.work_programs_department || [];
  const members = department.department_members_department || [];

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow={`Departemen · ${periodName}`}
        title={department.name}
        description={department.description}
        breadcrumbs={[
          { label: "Organisasi", href: "/organisasi" },
          { label: "Departemen", href: "/organisasi/departemen" },
          { label: department.name },
        ]}
      />

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-16">
          {/* SECTION 1: Carousel Tim Departemen */}
          <div>
            <DepartmentTeamCarousel members={members} departmentName={department.name} />
          </div>

          {/* SECTION 2: Program Kerja Departemen */}
          <div className="space-y-6 pt-4 border-t border-glass-border">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="size-5 text-accent" /> Program Kerja Departemen
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daftar program kerja dan agenda strategis yang dilaksanakan oleh {department.name}
              </p>
            </div>

            {workPrograms.length === 0 ? (
              <div className="glass rounded-3xl p-8 sm:p-10 text-center border border-glass-border">
                <p className="text-sm text-muted-foreground">
                  Belum ada program kerja yang dipublikasikan untuk departemen ini.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {workPrograms.map((program) => {
                  const statusInfo = statusMapping[program.status] || {
                    label: program.status,
                    className: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
                  };

                  return (
                    <div
                      key={program.id}
                      className="glass rounded-3xl p-6 border border-glass-border hover:border-accent/40 transition shadow-xl flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white leading-snug">
                          {program.name}
                        </h3>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                          {program.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-glass-border space-y-2 text-xs text-muted-foreground">
                        {program.target_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-accent shrink-0" />
                            <span>Waktu: <strong className="text-white">{program.target_time}</strong></span>
                          </div>
                        )}

                        {program.success_indicator && (
                          <div className="flex items-start gap-2">
                            <Target className="size-3.5 text-accent shrink-0 mt-0.5" />
                            <span>Indikator: <strong className="text-white">{program.success_indicator}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicPageFrame>
  );
}

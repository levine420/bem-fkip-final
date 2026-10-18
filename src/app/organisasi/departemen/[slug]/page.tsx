import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Target, Briefcase, Users } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { DepartmentTeamCarousel } from "@/components/DepartmentTeamCarousel";
import { EmptyState } from "@/components/EmptyState";
import { getDepartmentBySlug, getActiveDepartments } from "@/server/public/data";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const departments = await getActiveDepartments();
  return departments.filter((d) => d.slug).map((d) => ({ slug: d.slug! }));
}

const statusConfig: Record<string, { label: string; color: string }> = {
  SELESAI: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  BERJALAN: { label: "Sedang Berjalan", color: "bg-pink-50 text-[#BE185D] border-pink-200" },
  BELUM_MULAI: { label: "Akan Datang", color: "bg-slate-100 text-slate-600 border-slate-200" },
  DITUNDA: { label: "Ditunda", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  DIBATALKAN: { label: "Dibatalkan", color: "bg-red-50 text-red-600 border-red-200" },
};

export default async function DepartmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);
  const departments = await getActiveDepartments();

  if (!department) notFound();

  const workPrograms = department.work_programs_department || [];
  const members = department.department_members_department || [];
  const periodName = department.period
    ? `Kabinet ${department.period.name} (${department.period.year_start}–${department.period.year_end})`
    : "BEM FKIP UIKA";

  return (
    <PublicPageFrame>
      {/* Department tab switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D] mb-3">
          <Users className="w-4 h-4" />
          <span>Fungsionaris & Divisi Kerja</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {departments.map((item) => {
            const isActive = item.id === department.id;
            return (
              <Link
                key={item.id}
                href={`/organisasi/departemen/${item.slug || item.id}`}
                aria-current={isActive ? "page" : undefined}
                className={`text-xs px-4 py-2.5 rounded-xl font-bold transition-all duration-150 shrink-0 flex items-center gap-2 ${
                  isActive
                    ? "bg-[#E11D74] text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {item.name.slice(0, 20)}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Department hero banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-pink-950 p-6 sm:p-10 text-white border border-slate-800">
          <div className="max-w-3xl space-y-3 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 text-xs font-bold">
              {periodName}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{department.name}</h1>
            {department.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{department.description}</p>
            )}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-pink-600/10 to-transparent pointer-events-none" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Tim departemen */}
        <section>
          <DepartmentTeamCarousel members={members} departmentName={department.name} />
        </section>

        {/* Program kerja */}
        <section className="space-y-5 pt-4 border-t border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D] mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Matriks Program Kerja</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Program Kerja {department.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Daftar inisiatif terencana, sedang berjalan, dan telah terlaksana.</p>
          </div>

          {workPrograms.length === 0 ? (
            <EmptyState
              title="Belum ada program kerja"
              description="Program kerja departemen akan tampil setelah diisi melalui Admin Panel."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {workPrograms.map((program) => {
                const statusInfo = statusConfig[program.status] || { label: program.status, color: "bg-slate-100 text-slate-600 border-slate-200" };
                return (
                  <div key={program.id} className="bg-white rounded-xl border border-slate-200/90 hover:border-pink-300 transition-all duration-200 p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{program.name}</h3>
                      {program.description && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{program.description}</p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                      {program.target_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#E11D74] shrink-0" />
                          <span>Waktu: <strong className="text-slate-700">{program.target_time}</strong></span>
                        </div>
                      )}
                      {program.success_indicator && (
                        <div className="flex items-start gap-2">
                          <Target className="w-3.5 h-3.5 text-[#E11D74] shrink-0 mt-0.5" />
                          <span>Sasaran: <strong className="text-slate-700">{program.success_indicator}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PublicPageFrame>
  );
}

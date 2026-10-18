import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { EmptyState } from "@/components/EmptyState";
import { getPublicWorkPrograms, getActiveDepartments } from "@/server/public/data";
import { Briefcase, Clock, Target } from "lucide-react";

export const revalidate = 60;

const statusConfig: Record<string, { label: string; color: string }> = {
  SELESAI: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  BERJALAN: { label: "Sedang Berjalan", color: "bg-pink-50 text-[#BE185D] border-pink-200" },
  BELUM_MULAI: { label: "Akan Datang", color: "bg-slate-100 text-slate-600 border-slate-200" },
  DITUNDA: { label: "Ditunda", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  DIBATALKAN: { label: "Dibatalkan", color: "bg-red-50 text-red-600 border-red-200" },
};

export default async function ProgramsPage() {
  const [workPrograms, depts] = await Promise.all([
    getPublicWorkPrograms(),
    getActiveDepartments(),
  ]);

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Matriks Program Kerja"
        title="Program Kerja BEM FKIP UIKA"
        description="Daftar program kerja seluruh departemen dengan transparansi status pelaksanaan, indikator keberhasilan, dan target waktu."
        breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Program Kerja" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {workPrograms.length === 0 ? (
          <EmptyState
            title="Belum ada program kerja pada periode aktif"
            description="Program kerja dikelola oleh Admin Departemen sesuai kewenangannya."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {workPrograms.map((proker) => {
              const dept = depts.find(
                (d) => d.id === proker.department_id || d.slug === proker.department_id
              );
              const statusInfo = statusConfig[proker.status] || { label: proker.status, color: "bg-slate-100 text-slate-600 border-slate-200" };

              return (
                <div
                  key={proker.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-pink-300 transition-all duration-200 p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-[#BE185D] font-semibold">
                        {dept?.name || "Unggulan BEM"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{proker.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{proker.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#E11D74] shrink-0" />
                      <span>Target: <strong className="text-slate-700">{proker.target_waktu || "Periode Aktif"}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-[#E11D74] shrink-0 mt-0.5" />
                      <span>Sasaran: <strong className="text-slate-700">{proker.sasaran || "Mahasiswa FKIP UIKA"}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PublicPageFrame>
  );
}

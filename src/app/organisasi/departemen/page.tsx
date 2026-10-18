import Link from "next/link";
import { Users, Building2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { getActiveDepartments } from "@/server/public/data";

export const revalidate = 60;

export default async function DepartmentsPage() {
  const departments = await getActiveDepartments();

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Fungsionaris & Divisi Kerja"
        title="Departemen & Biro Kerja BEM FKIP UIKA"
        description="Setiap departemen memiliki fokus kerja terarah untuk melayani mahasiswa dan sivitas FKIP UIKA."
        breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Departemen" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {departments.length === 0 ? (
          <EmptyState
            title="Belum ada data departemen pada periode aktif"
            description="Daftar departemen harus berasal dari data organisasi yang telah dikonfirmasi dan dimasukkan melalui Admin."
          />
        ) : (
          <div className="bg-gradient-to-br from-pink-50/60 via-white to-slate-50 rounded-2xl border border-pink-100/80 p-6 sm:p-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D] mb-6">
              <Building2 className="w-4 h-4" />
              <span>Struktur Eksekutif</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {departments.map((dept) => (
                <Link
                  key={dept.id}
                  href={`/organisasi/departemen/${dept.slug || dept.id}`}
                  className="group block p-5 bg-white rounded-xl border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-pink-50 text-[#BE185D] border border-pink-200">
                        {dept.name.slice(0, 4).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#E11D74] transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {dept.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Lihat Pengurus
                    </span>
                    <span className="text-[#E11D74] font-bold group-hover:translate-x-0.5 transition-transform">
                      Eksplorasi →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicPageFrame>
  );
}

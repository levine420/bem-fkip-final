import { PublicListing } from "@/components/PublicListing";
import { departments as seedDepartments } from "@/lib/data/public-data";
import { getPublicWorkPrograms, getActiveDepartments } from "@/server/public/data";

export default async function ProgramsPage() {
  const [workPrograms, depts] = await Promise.all([
    getPublicWorkPrograms(),
    getActiveDepartments().catch(() => seedDepartments),
  ]);

  return (
    <PublicListing
      eyebrow="Organisasi"
      title="Program Kerja BEM FKIP UIKA"
      description="Daftar program kerja seluruh departemen dengan transparansi status pelaksanaan, indikator keberhasilan, dan target waktu."
      breadcrumbs={[{ label: "Organisasi", href: "/organisasi" }, { label: "Program Kerja" }]}
      toolbar={[
        { label: "Semua Program Kerja", href: "/organisasi/program-kerja" },
        { label: "Periode Aktif (2026–2027)", href: "/organisasi/program-kerja" },
      ]}
      emptyTitle="Belum ada program kerja yang tersedia"
      emptyDescription="Program kerja dikelola oleh Admin Departemen sesuai kewenangannya dan terikat pada periode aktif."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {workPrograms.map((proker) => {
          const dept = depts.find(
            (d) =>
              d.id === proker.department_id ||
              ("slug" in d && d.slug === proker.department_id) ||
              d.name.toLowerCase().includes(proker.department_id.toLowerCase())
          );
          return (
            <div
              key={proker.id}
              className="glass rounded-3xl p-6 transition duration-300 hover:border-accent/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {dept ? dept.name : "Unggulan BEM"}
                  </span>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      proker.status === "SELESAI"
                        ? "bg-green-500/20 text-green-300"
                        : proker.status === "BERJALAN"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {proker.status === "SELESAI"
                      ? "Selesai"
                      : proker.status === "BERJALAN"
                      ? "Sedang Berjalan"
                      : "Belum Mulai"}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{proker.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {proker.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-glass-border space-y-2 text-xs">
                <p>
                  <span className="text-muted-foreground">Target Waktu:</span>{" "}
                  <strong className="text-white font-medium">{proker.target_waktu || "Periode Aktif (2026–2027)"}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Sasaran / Target:</span>{" "}
                  <span className="text-soft font-medium">{proker.sasaran || "Mahasiswa FKIP UIKA"}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </PublicListing>
  );
}

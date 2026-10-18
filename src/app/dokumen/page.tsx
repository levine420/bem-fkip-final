import Link from "next/link";
import { FileText } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { EmptyState } from "@/components/EmptyState";
import { getPublicDocuments } from "@/server/public/data";

export const revalidate = 60;

const docCategories = [
  { label: "Semua Dokumen", value: "" },
  { label: "AD/ART", value: "AD_ART" },
  { label: "SK Pengurus", value: "SK" },
  { label: "LPJ", value: "LPJ" },
  { label: "Proposal", value: "PROPOSAL" },
];

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const docs = await getPublicDocuments({ category: category || undefined });
  const activeCategory = category || "";

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Dokumen"
        title="Arsip Publik Organisasi yang Terstruktur"
        description="Dokumen resmi organisasi BEM FKIP UIKA (AD/ART, SK, LPJ, dan Proposal) yang tersedia untuk ditelusuri."
        breadcrumbs={[{ label: "Dokumen" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Category filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {docCategories.map(({ label, value }) => (
            <Link
              key={value}
              href={value ? `/dokumen?category=${value}` : "/dokumen"}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                activeCategory === value
                  ? "bg-[#E11D74] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-pink-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Documents grid */}
        {docs.length === 0 ? (
          <EmptyState
            title="Belum ada dokumen publik"
            description="Dokumen resmi yang ditandai sebagai publik akan otomatis tampil di sini."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 bg-white rounded-xl border border-slate-200/90 hover:border-pink-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* File preview */}
                  <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                    <FileText className="size-12 text-red-300" />
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-50 text-red-500 rounded-md px-1.5 py-0.5 border border-red-100">
                      {doc.file_type?.split("/")[1]?.toUpperCase() || "PDF"}
                    </span>
                    <span className="absolute bottom-2 left-3 text-[10px] font-semibold text-[#BE185D] uppercase tracking-wider">
                      {doc.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">{doc.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono truncate">{doc.original_filename}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  <span className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
                    {doc.download_count}× unduh
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicPageFrame>
  );
}

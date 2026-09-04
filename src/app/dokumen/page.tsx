import { FileText } from "lucide-react";
import { PublicListing } from "@/components/PublicListing";
import { getPublicDocuments } from "@/server/public/data";

export const revalidate = 60;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const docs = await getPublicDocuments({ category: category || undefined });

  return (
    <PublicListing
      eyebrow="Dokumen"
      title="Perpustakaan Dokumen Organisasi"
      description="Akses dokumen resmi BEM FKIP UIKA yang telah ditandai publik (AD/ART, SK Pengurus, LPJ, dan Proposal)."
      breadcrumbs={[{ label: "Dokumen" }]}
      toolbar={[
        { label: "Semua Dokumen", href: "/dokumen" },
        { label: "AD/ART", href: "/dokumen?category=AD_ART" },
        { label: "SK Pengurus", href: "/dokumen?category=SK" },
        { label: "LPJ", href: "/dokumen?category=LPJ" },
      ]}
      emptyTitle="Belum ada dokumen publik"
      emptyDescription="Metadata dan file dokumen berasal dari penyimpanan resmi. File privat hanya dapat diakses oleh pengurus berwenang."
    >
      {docs.length === 0 ? (
        <div className="col-span-full glass rounded-3xl p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada dokumen publik yang diunggah.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <div key={doc.id} className="glass rounded-3xl p-5 flex flex-col justify-between transition duration-300 hover:border-accent/50">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <FileText className="size-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">{doc.category}</span>
                  <h4 className="font-semibold text-sm text-white mt-1 line-clamp-2">{doc.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{doc.original_filename}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-glass-border flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{(doc.file_size / 1024 / 1024).toFixed(2)} MB · {doc.download_count}x unduh</span>
                <a
                  href={`/api/public/documents/${doc.id}/download`}
                  className="focus-ring rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium text-accent hover:border-accent hover:bg-accent/10"
                >
                  Unduh PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </PublicListing>
  );
}

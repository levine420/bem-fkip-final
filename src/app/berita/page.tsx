import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, BookOpen } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { EmptyState } from "@/components/EmptyState";
import { getPublishedContents } from "@/server/public/data";

export const dynamic = "force-dynamic";

type SearchParams = { category?: string; q?: string; page?: string };

const categories = [
  ["", "Semua"],
  ["PENGUMUMAN", "Pengumuman"],
  ["BERITA", "Berita"],
  ["KAJIAN", "Kajian"],
] as const;

export default async function NewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const category = categories.some(([v]) => v === params.category) ? params.category || "" : "";
  const q = params.q?.trim() || "";
  const pageSize = 12;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const { items, total } = await getPublishedContents({
    category: category || undefined,
    search: q || undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  const href = (c = category, p = 1) =>
    "/berita?" +
    new URLSearchParams({
      ...(c ? { category: c } : {}),
      ...(q ? { q } : {}),
      ...(p > 1 ? { page: String(p) } : {}),
    }).toString();
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (page > lastPage) redirect(href(category, lastPage));

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Portal Editorial & Warta Resmi"
        title="Warta BEM FKIP UIKA"
        description="Liputan kegiatan, catatan advokasi kampus, prestasi mahasiswa calon guru, dan opini pendidikan kontemporer."
        breadcrumbs={[{ label: "Warta FKIP" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Filter + Search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(([value, label]) => (
              <Link
                key={value}
                href={href(value)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium shrink-0 transition-colors ${
                  category === value
                    ? "bg-[#E11D74] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
                aria-current={category === value ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
          {/* Search */}
          <form action="/berita" className="relative w-full md:w-72">
            {category && <input type="hidden" name="category" value={category} />}
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              key={q}
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari berita atau isu..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E11D74] bg-white"
            />
          </form>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <EmptyState
            title={q || category ? "Tidak ada warta yang cocok" : "Belum ada warta yang diterbitkan"}
            description="Informasi resmi akan tampil setelah dipublikasikan."
          />
        ) : (
          <div className="space-y-10">
            {/* Lead story */}
            {featured && (
              <Link
                href={`/berita/${featured.slug}`}
                className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-pink-300 hover:shadow-md transition-all duration-200 grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                <div className="lg:col-span-7 h-64 sm:h-80 lg:h-96 relative overflow-hidden bg-slate-100">
                  {featured.thumbnail_url ? (
                    <img
                      src={featured.thumbnail_url}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="size-16 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-md bg-[#E11D74] px-3 py-1 text-xs font-bold text-white">Kabar Utama</span>
                  </div>
                </div>
                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <span className="text-[#BE185D] font-bold">{featured.category}</span>
                      {featured.published_at && (
                        <>
                          <span>•</span>
                          <time>{new Date(featured.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}</time>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-[#E11D74] transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{featured.excerpt}</p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    {featured.author && <span className="font-semibold text-slate-700">Oleh: {featured.author.name}</span>}
                    <span className="text-[#BE185D] font-bold flex items-center gap-1">Baca Warta →</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Secondary grid */}
            {rest.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Warta Terkini Lainnya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((article) => (
                    <Link
                      key={article.id}
                      href={`/berita/${article.slug}`}
                      className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:border-pink-300 hover:shadow-sm transition-all duration-200 flex flex-col"
                    >
                      <div className="h-44 w-full overflow-hidden bg-slate-100">
                        {article.thumbnail_url ? (
                          <img
                            src={article.thumbnail_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="size-10 text-slate-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-semibold text-[#BE185D]">{article.category}</span>
                            {article.published_at && (
                              <>
                                <span>•</span>
                                <time>{new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" })}</time>
                              </>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#E11D74] transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h4>
                          {article.excerpt && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                          )}
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          {article.author && <span className="truncate max-w-[140px]">{article.author.name}</span>}
                          <span className="text-[#BE185D] font-semibold">Baca →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <nav aria-label="Halaman berita" className="flex flex-wrap items-center justify-between gap-3 text-sm pt-4 border-t border-slate-100">
            <span className="text-slate-500 text-xs">Halaman {page} · {total} publikasi</span>
            <div className="flex gap-3">
              {page > 1 && (
                <Link className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors" href={href(category, page - 1)}>
                  ← Sebelumnya
                </Link>
              )}
              {page * pageSize < total && (
                <Link className="rounded-lg bg-[#E11D74] px-4 py-2 text-xs font-medium text-white hover:bg-[#BE185D] transition-colors" href={href(category, page + 1)}>
                  Berikutnya →
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </PublicPageFrame>
  );
}

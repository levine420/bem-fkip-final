import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicListing } from "@/components/PublicListing";
import { getPublishedContents } from "@/server/public/data";

export const dynamic = "force-dynamic";
export const revalidate = 30;

type SearchParams = { category?: string; q?: string };

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, q } = await searchParams;

  const { items: newsList } = await getPublishedContents({
    category: category || undefined,
    search: q || undefined,
    limit: 50,
  });

  return (
    <PublicListing
      eyebrow="Publikasi"
      title="Berita & Pengumuman"
      description="Pusat informasi resmi BEM FKIP UIKA. Berita terkini, pengumuman kelembagaan, dan hasil kajian akademis."
      breadcrumbs={[{ label: "Berita" }]}
      toolbar={[
        { label: "Semua", href: "/berita" },
        { label: "Pengumuman", href: "/berita?category=PENGUMUMAN" },
        { label: "Berita", href: "/berita?category=BERITA" },
        { label: "Kajian", href: "/berita?category=KAJIAN" },
      ]}
      emptyTitle="Belum ada konten berstatus Terbit"
      emptyDescription="Admin Departemen dapat membuat draf dan mengajukan review. Konten baru terlihat di sini setelah diterbitkan Super Admin."
    >
      {newsList.length === 0 ? (
        <div className="col-span-full glass rounded-3xl p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada berita yang diterbitkan.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((news) => {
            const thumbnail = news.thumbnail_url || "/images/news-scholarship.png";

            return (
              <Link
                key={news.id}
                href={`/berita/${news.slug}`}
                className="glass group rounded-3xl p-5 transition duration-300 hover:border-accent/50 flex flex-col justify-between shadow-lg overflow-hidden"
              >
                <div>
                  {/* News Thumbnail Image */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-4 border border-glass-border">
                    <Image
                      src={thumbnail}
                      alt={news.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-accent/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white uppercase shadow-md">
                        {news.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-2">
                    <span>
                      {news.published_at
                        ? new Date(news.published_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Terbaru"}
                    </span>
                    <span>{news.reading_time || 3} min baca</span>
                  </div>

                  <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-accent transition">
                    {news.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {news.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-glass-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    {news.author?.name || "Tim Redaksi BEM"}
                  </span>
                  <span className="text-accent flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
                    Baca Artikel <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PublicListing>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getPublishedContentBySlug, getPublishedContents } from "@/server/public/data";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";
import { EmptyState } from "@/components/EmptyState";
import { Calendar, User, Clock, Tag, ArrowLeft, Share2 } from "lucide-react";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedContentBySlug(slug);

  if (!article) {
    return (
      <PublicPageFrame>
        <PublicPageHero
          eyebrow="Artikel Tidak Ditemukan"
          title="Berita Tidak Tersedia"
          description="Artikel berita yang Anda cari mungkin belum diterbitkan atau telah diarsipkan."
          breadcrumbs={[{ label: "Berita", href: "/berita" }, { label: "Tidak Ditemukan" }]}
        />
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <EmptyState
              title="Artikel Tidak Ditemukan"
              description="Hanya konten berita berstatus Terbit yang dapat dibaca di website publik."
            />
          </div>
        </section>
      </PublicPageFrame>
    );
  }

  const { items: related } = await getPublishedContents({
    category: article.category,
    limit: 3,
  });
  const otherNews = related.filter((item) => item.slug !== article.slug);

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Terbaru";

  const bannerImage =
    article.thumbnail_url ||
    "/images/news-scholarship.png";

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow={`Kategori: ${article.category}`}
        title={article.title}
        description={article.excerpt || "Baca selengkapnya wawasan dan berita resmi BEM FKIP UIKA Bogor."}
        breadcrumbs={[{ label: "Berita", href: "/berita" }, { label: article.title }]}
      />

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-accent transition"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Semua Berita
          </Link>

          {/* Article Header Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-glass-border pb-4">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="h-4 w-4 text-accent" /> {article.author?.name || "Tim Redaksi BEM"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent" /> {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" /> {article.reading_time || 3} menit baca
            </span>
            <span className="ml-auto rounded-full bg-accent/20 px-3 py-1 text-[11px] font-bold text-accent uppercase">
              {article.category}
            </span>
          </div>

          {/* Featured Hero Thumbnail Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-glass-border shadow-2xl">
            <Image
              src={bannerImage}
              alt={article.title}
              fill
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Article Body Content */}
          <article className="glass rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line font-sans">
              {article.body}
            </div>

            {/* Tags section */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-glass-border flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 border border-glass-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Related Articles Grid */}
          {otherNews.length > 0 && (
            <div className="pt-8 space-y-4">
              <h3 className="font-display text-xl font-bold text-foreground">Berita Terkait Lainnya</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {otherNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="glass group rounded-2xl p-4 transition-all hover:border-accent/40"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-3">
                      <Image
                        src={item.thumbnail_url || "/images/news-platform.png"}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      {item.category}
                    </span>
                    <h4 className="mt-1 font-bold text-foreground line-clamp-2 text-sm group-hover:text-accent transition">
                      {item.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicPageFrame>
  );
}

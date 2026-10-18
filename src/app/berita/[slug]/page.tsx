import Image from "next/image";
import Link from "next/link";
import { getPublishedContentBySlug, getPublishedContents } from "@/server/public/data";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, Calendar, Clock, Tag, User, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedContentBySlug(slug);

  if (!article) notFound();

  const { items: related } = await getPublishedContents({ category: article.category, limit: 4 });
  const otherNews = related.filter((item) => item.slug !== article.slug).slice(0, 3);

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
      })
    : "Terbaru";

  return (
    <PublicPageFrame>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Back button */}
        <Link
          href="/berita"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#BE185D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Warta FKIP
        </Link>

        {/* Article header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-pink-50 text-[#BE185D] border border-pink-200 px-2.5 py-1 text-xs font-bold">
              {article.category}
            </span>
            {article.published_at && (
              <span className="text-xs text-slate-400">
                {formattedDate}
              </span>
            )}
            {article.reading_time && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {article.reading_time} menit baca
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Author + share */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-[#BE185D] flex items-center justify-center font-bold text-sm">
                {article.author?.name?.charAt(0) || "B"}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{article.author?.name || "Tim Redaksi BEM"}</p>
                <p className="text-xs text-slate-500">{article.department?.name || "BEM FKIP UIKA"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {article.thumbnail_url && (
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 bg-slate-100">
            <Image
              unoptimized
              src={article.thumbnail_url}
              alt={article.title}
              width={900}
              height={500}
              className="w-full max-h-[460px] object-cover"
              priority
            />
          </div>
        )}

        {/* Article body */}
        <div className="max-w-[70ch] mx-auto text-slate-800 text-base sm:text-lg leading-[1.8] space-y-6 pt-2">
          {article.body
            ? article.body.split("\n\n").map((para, idx) => (
                <p key={idx} className="leading-relaxed">{para}</p>
              ))
            : <p className="text-slate-400 italic">Konten artikel belum tersedia.</p>
          }
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="max-w-[70ch] mx-auto pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author callout */}
        <div className="max-w-[70ch] mx-auto p-5 bg-pink-50/60 rounded-xl border border-pink-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#E11D74] text-white flex items-center justify-center shrink-0 font-bold text-xs">
            FKIP
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900">Departemen Komunikasi & Informasi BEM FKIP UIKA.</strong>{" "}
            Komitmen kami menyajikan warta yang akurat, berimbang, dan menginspirasi seluruh mahasiswa keguruan.
          </p>
        </div>

        {/* Related news */}
        {otherNews.length > 0 && (
          <section className="pt-10 border-t border-slate-200 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Warta & Artikel Terkait</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {otherNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-pink-300 transition-all duration-150 flex flex-col"
                >
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-32 w-full flex items-center justify-center bg-slate-100">
                      <BookOpen className="size-8 text-slate-200" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <p className="text-[11px] font-semibold text-[#BE185D]">{item.category}</p>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#E11D74] transition-colors line-clamp-2 leading-snug mt-1">
                        {item.title}
                      </h4>
                    </div>
                    {item.published_at && (
                      <p className="text-[11px] text-slate-400">
                        {new Date(item.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PublicPageFrame>
  );
}

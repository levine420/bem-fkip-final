import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";

type NewsItem = { id: string; slug: string; title: string; excerpt: string | null; thumbnail_url: string | null; category: string; published_at: Date | string | null; reading_time?: number | null; author?: { name: string } | null };
export function NewsCards({ items }: { items: NewsItem[] }) {
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {items.map((news, index) => <Link key={news.id} href={`/berita/${news.slug}`} className={`glass glass-hover group overflow-hidden rounded-2xl ${index === 0 ? "md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-[1.2fr_1fr]" : "flex flex-col"}`}>
      <div className={`relative overflow-hidden bg-muted ${index === 0 ? "aspect-video lg:aspect-auto lg:min-h-80" : "aspect-video"}`}>
        {news.thumbnail_url ? <img src={news.thumbnail_url} alt="" loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" /> : <div className="grid h-full min-h-48 place-items-center text-muted-foreground"><Newspaper size={40} aria-label="Tanpa gambar" /></div>}
        {index === 0 && <span className="absolute left-4 top-4 rounded-md bg-brand px-3 py-1 text-xs">Warta terbaru</span>}
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-semibold text-accent">{news.category}</span>{news.published_at && <time className="text-muted-foreground" dateTime={new Date(news.published_at).toISOString()}>· {new Date(news.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}</time>}</div>
        <h2 className={`mt-4 font-bold leading-snug tracking-tight group-hover:text-accent ${index === 0 ? "text-2xl sm:text-3xl" : "text-lg"}`}>{news.title}</h2>
        {news.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{news.excerpt}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs"><span className="mt-5 text-muted-foreground">{news.author?.name}{news.reading_time ? ` · ${news.reading_time} menit baca` : ""}</span><span className="mt-5 inline-flex items-center gap-1 font-semibold text-accent">Baca warta <ArrowUpRight size={14} /></span></div>
      </div>
    </Link>)}
  </div>;
}

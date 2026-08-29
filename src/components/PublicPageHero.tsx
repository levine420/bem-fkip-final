import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PublicPageHero({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <section className="relative overflow-hidden px-4 pb-6 pt-16 sm:px-6 sm:pt-20">
      {/* Top ambient glow behind navbar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#6b0f2e]/60 via-[#4a0a1f]/35 to-transparent blur-2xl" />

      <div className="orb -left-28 -top-20 size-[28rem] bg-primary/30" />
      <div className="orb right-[-8rem] -top-10 size-[28rem] bg-accent/25" />
      <div className="relative mx-auto max-w-7xl">
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link className="focus-ring rounded hover:text-accent" href="/">Beranda</Link>
          {breadcrumbs.map((item) => (
            <span key={`${item.label}-${item.href ?? "current"}`} className="flex items-center gap-1.5">
              <ChevronRight className="size-3" />
              {item.href ? <Link className="focus-ring rounded hover:text-accent" href={item.href}>{item.label}</Link> : <span className="text-foreground">{item.label}</span>}
            </span>
          ))}
        </nav>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</span>
        <h1 className="mt-2 max-w-4xl font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      </div>
    </section>
  );
}

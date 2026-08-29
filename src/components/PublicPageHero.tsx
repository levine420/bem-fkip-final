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
    <section className="relative overflow-hidden px-4 pb-3 pt-16 sm:px-6 sm:pb-4 sm:pt-20">
      {/* Seamless full hero backdrop ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/35 via-accent/20 to-transparent blur-3xl" />

      {/* Atmosphere Orbs */}
      <div className="orb -left-20 -top-24 size-[36rem] bg-primary/35" />
      <div className="orb right-[-10%] -top-12 size-[36rem] bg-accent/25" />

      <div className="relative mx-auto max-w-7xl">
        <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link className="focus-ring rounded hover:text-accent" href="/">Beranda</Link>
          {breadcrumbs.map((item) => (
            <span key={`${item.label}-${item.href ?? "current"}`} className="flex items-center gap-1.5">
              <ChevronRight className="size-3" />
              {item.href ? <Link className="focus-ring rounded hover:text-accent" href={item.href}>{item.label}</Link> : <span className="text-foreground">{item.label}</span>}
            </span>
          ))}
        </nav>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</span>
        <h1 className="mt-1 max-w-4xl font-display text-2xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      </div>
    </section>
  );
}

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
  description?: string | null;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  hideBackdrop?: boolean;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 border-b border-slate-200 mb-0">
      {/* Breadcrumb */}
      <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link className="hover:text-[#E11D74] transition-colors" href="/">Beranda</Link>
        {breadcrumbs.map((item) => (
          <span key={`${item.label}-${item.href ?? "current"}`} className="flex items-center gap-1.5">
            <ChevronRight className="size-3 text-slate-300" />
            {item.href
              ? <Link className="hover:text-[#E11D74] transition-colors" href={item.href}>{item.label}</Link>
              : <span className="text-slate-900 font-medium">{item.label}</span>}
          </span>
        ))}
      </nav>
      {/* Eyebrow */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D] mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E11D74]" />
        <span>{eyebrow}</span>
      </div>
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight max-w-4xl">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">{description}</p>
      )}
    </div>
  );
}

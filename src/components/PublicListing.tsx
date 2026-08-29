import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

export function PublicListing({
  eyebrow,
  title,
  description,
  emptyTitle,
  emptyDescription,
  breadcrumbs,
  toolbar = [],
  note,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  toolbar?: Array<{ label: string; href: string }>;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <PublicPageFrame>
      <PublicPageHero eyebrow={eyebrow} title={title} description={description} breadcrumbs={breadcrumbs} />
      <section className="relative px-4 pb-12 pt-2 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-7xl">
          {toolbar.length ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {toolbar.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="focus-ring inline-flex min-h-8 items-center rounded-full border border-glass-border bg-glass px-3.5 text-xs font-semibold text-muted-foreground hover:border-accent/60 hover:text-accent transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
          {note ? <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
          {children ? children : <EmptyState title={emptyTitle} description={emptyDescription} />}
        </div>
      </section>
    </PublicPageFrame>
  );
}

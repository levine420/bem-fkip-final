import Link from "next/link";
import { DatabaseZap } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="glass rounded-3xl px-6 py-10 text-center sm:px-10">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-glass-border text-accent">
        <DatabaseZap className="size-5" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="focus-ring mt-5 inline-flex min-h-11 items-center rounded-full border border-glass-border px-5 text-sm font-semibold hover:border-accent/60 hover:text-accent"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

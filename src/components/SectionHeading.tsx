import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</span>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
        {description ? (
          <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

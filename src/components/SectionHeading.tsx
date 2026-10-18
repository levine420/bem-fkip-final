import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  icon,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D]">
          {icon}
          <span>{eyebrow}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

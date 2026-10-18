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
    <div className="bg-white rounded-2xl border border-slate-200 px-6 py-10 text-center sm:px-10">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-pink-50 text-[#E11D74] border border-pink-100">
        <DatabaseZap className="size-5" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:border-pink-300 hover:text-[#E11D74] transition-colors"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

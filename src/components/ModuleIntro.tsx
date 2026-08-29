import Link from "next/link";
import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

export function ModuleIntro({
  title,
  description,
  actions = [],
  children,
}: {
  title: string;
  description: string;
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
  children?: ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {actions.length ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link key={action.href} href={action.href} className={`${action.primary ? "bg-brand text-primary-foreground" : "border border-glass-border text-foreground"} focus-ring inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold`}>
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : (
        <div className="mt-6 flex gap-3 rounded-2xl border border-glass-border bg-white/[0.025] p-4">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-muted-foreground">Data nyata belum disambungkan pada fase frontend foundation. Modul ini sengaja tidak menampilkan angka, pengguna, konten, atau aktivitas fiktif.</p>
        </div>
      )}
    </section>
  );
}

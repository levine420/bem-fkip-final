import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNavMenu } from "@/components/MobileNavMenu";

export function WorkspaceShell({
  productLabel,
  title,
  description,
  navigation,
  activeHref,
  children,
  exitHref,
  exitLabel,
  mobileBottomNavigation = false,
  extraSidebarAction,
}: {
  productLabel: string;
  title: string;
  description: string;
  navigation: ReadonlyArray<{ label: string; href: string }>;
  activeHref?: string;
  children: ReactNode;
  exitHref: string;
  exitLabel: string;
  mobileBottomNavigation?: boolean;
  extraSidebarAction?: ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-background px-3 py-3 sm:px-5 sm:py-5 ${mobileBottomNavigation ? "pb-24 lg:pb-5" : ""}`}>
      <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <aside className="glass-strong hidden h-fit rounded-3xl p-4 lg:block lg:sticky lg:top-5">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-2xl p-2">
            <span className="bg-brand grid size-10 place-items-center rounded-xl font-display text-sm font-extrabold text-white">BF</span>
            <span>
              <span className="block font-display text-sm font-bold">BEM FKIP UIKA</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{productLabel}</span>
            </span>
          </Link>
          <nav className="mt-6 grid gap-1" aria-label={`${productLabel} navigation`}>
            {navigation.map((item) => {
              const active = activeHref === item.href;
              return (
                <Link key={item.href} href={item.href} className={`focus-ring rounded-xl px-3 py-3 text-sm transition-colors ${active ? "bg-[var(--glass-bg-strong)] font-semibold text-foreground" : "text-muted-foreground hover:bg-[var(--glass-bg)] hover:text-foreground"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {extraSidebarAction}

          <Link href={exitHref} className="focus-ring mt-3 block rounded-xl border border-glass-border px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground hover:border-accent/50 hover:text-accent">
            {exitLabel}
          </Link>
        </aside>

        {/* Main Workspace Area */}
        <main className="min-w-0">
          {/* Mobile Top Navigation Menu */}
          <MobileNavMenu
            productLabel={productLabel}
            navigation={navigation}
            activeHref={activeHref}
            exitHref={exitHref}
            exitLabel={exitLabel}
            extraAction={extraSidebarAction}
          />

          <header className="glass rounded-3xl px-5 py-6 sm:px-7">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{productLabel}</span>
            <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          </header>
          <div className="mt-4">{children}</div>
        </main>
      </div>

      {mobileBottomNavigation ? (
        <nav aria-label="Mobile bottom navigation" className="glass-strong fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 gap-1 rounded-2xl p-2 lg:hidden shadow-2xl">
          {navigation.slice(0, 4).map((item) => {
            const active = activeHref === item.href;
            return <Link key={item.href} href={item.href} className={`focus-ring rounded-xl px-1 py-2.5 text-center text-[11px] font-medium ${active ? "bg-brand text-white font-semibold" : "text-muted-foreground"}`}>{item.label}</Link>;
          })}
        </nav>
      ) : null}
    </div>
  );
}

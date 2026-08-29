import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grain relative min-h-screen w-full overflow-x-hidden bg-background px-4 py-12 flex flex-col items-center justify-center">
      {/* Background Glow Atmosphere */}
      <div className="orb left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 size-[36rem] bg-primary/20" />
      <div className="orb left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[28rem] bg-accent/15" />
      <div className="orb left-1/2 top-1/4 -translate-x-1/2 size-[24rem] bg-amber-500/15" />

      {/* Dead-Centered Container */}
      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center my-auto">
        
        {/* Centered Brand Logo & Title */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link href="/" className="focus-ring inline-flex flex-col items-center gap-3 group">
            <div className="relative size-16 p-2.5 bg-amber-500/10 rounded-3xl border border-amber-500/30 group-hover:scale-105 transition shadow-2xl flex items-center justify-center">
              <Image
                src="/images/logo-altiora.png"
                alt="Logo Kabinet Altiora BEM FKIP UIKA"
                width={64}
                height={64}
                priority
                className="size-11 object-contain drop-shadow"
              />
            </div>
            <div className="text-center">
              <span className="block font-display text-2xl font-extrabold text-foreground tracking-tight">BEM FKIP UIKA</span>
              <span className="block text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mt-1">Kabinet Altiora 2026–2027</span>
            </div>
          </Link>
        </div>

        {/* Centered Main Form Card */}
        <section className="glass-strong relative w-full overflow-hidden rounded-[2.5rem] border border-glass-border p-6 sm:p-10 shadow-2xl bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-2xl text-left">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">{eyebrow}</span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground mt-1.5">{title}</h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">{description}</p>
          </div>

          <div>{children}</div>

          {footer ? (
            <div className="mt-6 border-t border-glass-border pt-5 text-center text-xs sm:text-sm text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </section>

        {/* Back to Home Link */}
        <div className="mt-5 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-accent transition inline-flex items-center gap-1">
            ← Kembali ke Beranda Utama
          </Link>
        </div>

      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-2.5 sm:px-6 sm:pt-3.5">
      <div
        className={`relative mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 transition-all duration-300 sm:px-5 ${
          scrolled ? "glass-strong shadow-2xl border border-glass-border bg-slate-950/80" : "glass bg-slate-950/40"
        }`}
      >
        <Link href="/" className="focus-ring flex min-w-0 items-center gap-2.5 rounded-xl">
          <div className="relative size-9 shrink-0">
            <Image
              src="/images/logo-altiora.png"
              alt="Logo Kabinet Altiora BEM FKIP UIKA"
              width={36}
              height={36}
              priority
              className="size-9 object-contain drop-shadow"
            />
          </div>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-sm font-bold text-foreground">BEM FKIP UIKA</span>
            <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Platform Digital
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="mx-auto hidden items-center gap-0.5 xl:flex">
          {siteConfig.publicNavigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="focus-ring rounded-full px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-[var(--glass-bg)] hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="bg-brand focus-ring hidden min-h-10 items-center rounded-full px-4.5 text-[13px] font-semibold text-white transition-shadow hover:shadow-md sm:inline-flex"
          >
            Masuk Portal
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="relative z-50 flex size-11 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-foreground xl:hidden active:scale-95 transition cursor-pointer select-none shrink-0"
          >
            {open ? <X className="size-6 text-amber-400" /> : <Menu className="size-6 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="mx-auto mt-2 w-full max-w-7xl overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-950/98 p-4 shadow-2xl backdrop-blur-3xl xl:hidden z-50 relative block">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 px-2 mb-3 flex items-center justify-between">
            <span>Navigasi Kabinet Altiora</span>
            <span className="text-[10px] text-muted-foreground font-normal">2026–2027</span>
          </div>
          <ul className="grid gap-1">
            {siteConfig.publicNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3.5 py-3 text-sm font-semibold text-foreground hover:bg-amber-500/15 hover:text-amber-300 transition active:bg-amber-500/25"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="bg-brand focus-ring mt-3 block rounded-xl px-4 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-brand-dark transition active:scale-98"
          >
            Masuk Portal Mahasiswa
          </Link>
        </div>
      )}
    </header>
  );
}

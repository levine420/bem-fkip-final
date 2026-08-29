"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Globe, LogOut } from "lucide-react";

export function MobileNavMenu({
  productLabel,
  navigation,
  activeHref,
  exitHref,
  exitLabel,
  extraAction,
}: {
  productLabel: string;
  navigation: ReadonlyArray<{ label: string; href: string }>;
  activeHref?: string;
  exitHref: string;
  exitLabel: string;
  extraAction?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden mb-4">
      {/* Mobile Bar Top */}
      <div className="glass flex items-center justify-between rounded-2xl p-3.5 shadow-md">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="bg-brand grid size-9 place-items-center rounded-xl font-display text-xs font-extrabold text-white shadow-xs">
            BF
          </span>
          <div>
            <span className="block text-sm font-bold text-foreground">{productLabel}</span>
            <span className="block text-[10px] text-muted-foreground">BEM FKIP UIKA</span>
          </div>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-glass-border bg-brand/10 px-3 py-2 text-xs font-bold text-brand hover:bg-brand hover:text-white transition"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span>{isOpen ? "Tutup" : "Menu Navigasi"}</span>
        </button>
      </div>

      {/* Expanded Menu Drawer */}
      {isOpen && (
        <div className="mt-2 rounded-2xl border border-border bg-card p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
            Pilihan Menu Navigasi ({navigation.length})
          </div>
          <div className="grid gap-1 max-h-[60vh] overflow-y-auto pr-1">
            {navigation.map((item) => {
              const active = activeHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "bg-brand text-white shadow-xs"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {extraAction && <div className="pt-2 border-t border-border">{extraAction}</div>}

          <div className="pt-2 border-t border-border">
            <Link
              href={exitHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-brand transition"
            >
              <Globe className="h-3.5 w-3.5" /> {exitLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, Info, LogIn, Menu, MessageSquareHeart, Newspaper, Sparkles, Users, X } from "lucide-react";
import { siteConfig } from "@/config/site";

const icons: Record<string, React.ReactNode> = {
  "/": <Sparkles className="size-4" />,
  "/kegiatan": <Calendar className="size-4" />,
  "/berita": <Newspaper className="size-4" />,
  "/organisasi/departemen": <Users className="size-4" />,
  "/tentang": <Info className="size-4" />,
  "/layanan/bank-aspirasi": <MessageSquareHeart className="size-4" />,
};

export function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };
  }, [open]);

  const active = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-md">
        <a href="#main-content" className="skip-link">Lewati ke konten</a>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3 rounded-lg p-1">
            <motion.span whileHover={{ scale: 1.05, rotate: 1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="relative grid size-10 shrink-0 place-items-center">
              <Image src="/images/logo-altiora.png" alt="Logo BEM FKIP UIKA" width={40} height={40} priority className="size-10 object-contain" />
            </motion.span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-[#BE185D] sm:text-lg">BEM FKIP UIKA</span>
                <span className="hidden rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#BE185D] sm:inline-block">Kabinet Altiora</span>
              </span>
              <span className="line-clamp-1 block text-[11px] font-medium leading-tight text-slate-500">Universitas Ibn Khaldun Bogor</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {siteConfig.publicNavigation.map((item) => {
              const isActive = active(item.href);
              return (
                <motion.div key={item.href} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex select-none items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-150 ${isActive ? "bg-pink-50/80 text-[#BE185D]" : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"}`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span layoutId="navbar-active-indicator" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#E11D74]" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
              <Link href="/auth/login" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900">
                <LogIn className="size-3.5 text-[#E11D74]" /> Masuk Portal
              </Link>
            </motion.div>
          </div>

          <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden" aria-label="Buka menu navigasi" aria-expanded={open} aria-controls="public-mobile-menu">
            <Menu className="size-6" />
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
            <motion.div id="public-mobile-menu" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-y-0 right-0 flex w-[85%] max-w-sm flex-col border-l border-slate-100 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <Image src="/images/logo-altiora.png" alt="" width={32} height={32} className="size-8 object-contain" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">BEM FKIP UIKA</p>
                    <p className="text-[10px] text-slate-500">Kabinet Altiora</p>
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800" aria-label="Tutup menu">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1.5 overflow-y-auto py-4" aria-label="Navigasi mobile">
                {siteConfig.publicNavigation.map((item) => {
                  const isActive = active(item.href);
                  return (
                    <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined} onClick={() => setOpen(false)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-pink-50 text-[#BE185D]" : "text-slate-700 hover:bg-slate-50"}`}>
                      <span className={isActive ? "text-[#E11D74]" : "text-slate-400"}>{icons[item.href] ?? <Sparkles className="size-4" />}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <Link href="/auth/login" onClick={() => setOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs">
                  <LogIn className="size-4 text-[#E11D74]" /> Masuk Portal Mahasiswa
                </Link>
                <p className="text-center text-[11px] text-slate-400">Gedung FKIP UIKA • Bogor 16162</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import Link from "next/link";
import Image from "next/image";
import { CircleAlert } from "lucide-react";
import { siteConfig } from "@/config/site";

export function PublicFooter() {
  return (
    <footer className="relative border-t border-glass-border px-4 pb-8 pt-16 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="relative size-10 shrink-0">
              <Image src="/images/logo-altiora.png" alt="Logo Kabinet Altiora BEM FKIP UIKA" width={40} height={40} className="size-10 object-contain drop-shadow" />
            </div>
            <span className="leading-tight">
              <span className="block font-display text-base font-bold">BEM FKIP UIKA</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Platform Digital</span>
            </span>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">{siteConfig.description}</p>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Navigasi</h3>
          <ul className="mt-5 grid gap-2.5">
            {siteConfig.publicNavigation.slice(1).map((item) => (
              <li key={item.href}><Link href={item.href} className="focus-ring rounded text-sm text-muted-foreground hover:text-accent">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Layanan</h3>
          <ul className="mt-5 grid gap-2.5 text-sm text-muted-foreground">
            <li><Link className="focus-ring rounded hover:text-accent" href="/layanan/bank-aspirasi">Bank Aspirasi</Link></li>
            <li><Link className="focus-ring rounded hover:text-accent" href="/auth/login">Portal Mahasiswa</Link></li>
            <li><Link className="focus-ring rounded hover:text-accent" href="/dokumen">Dokumen Organisasi</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Kontak Resmi</h3>
          <div className="glass mt-5 rounded-2xl p-4">
            <div className="flex gap-3">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-muted-foreground">Kontak BEM ditampilkan hanya setelah dikonfirmasi dan disimpan melalui pengaturan Admin.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-glass-border pt-6 text-[12px] text-muted-foreground sm:flex-row sm:justify-between">
        <span>Platform Digital BEM FKIP UIKA</span>
        <span className="flex gap-4"><Link href="/kebijakan-privasi">Kebijakan Privasi</Link><Link href="/syarat-ketentuan">Syarat & Ketentuan</Link></span>
      </div>
    </footer>
  );
}

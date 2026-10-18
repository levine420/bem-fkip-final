import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

const prodi = [
  "Pendidikan Agama Islam (PAI)",
  "Pendidikan Bahasa Inggris (PBI)",
  "Pendidikan Luar Sekolah (PLS)",
  "Teknologi Pendidikan (TP)",
];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 pb-10 pt-14 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-800 pb-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src="/images/logo-altiora.png" alt="Logo Kabinet Altiora BEM FKIP UIKA" width={40} height={40} className="size-10 object-contain" />
              <div>
                <p className="text-base font-bold leading-tight tracking-tight text-white">BEM FKIP UIKA BOGOR</p>
                <p className="text-xs font-medium text-pink-300/80">Kabinet Altiora</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">{siteConfig.description}</p>
            <div className="flex items-center gap-3 pt-1">
              <Link href="/kontak" aria-label="Kontak BEM FKIP" className="flex size-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-[#E11D74] hover:text-white">
                <Mail className="size-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Program Studi FKIP</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              {prodi.map((p) => (
                <li key={p} className="flex items-center gap-1.5 transition-colors hover:text-white">
                  <span className="size-1.5 rounded-full bg-[#E11D74]" /> {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Akses Informasi</h3>
            <ul className="space-y-2 text-xs">
              {siteConfig.publicNavigation.slice(1).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center gap-1 text-slate-400 transition-colors hover:text-white">
                    {item.label} <ArrowUpRight className="size-3 text-slate-500" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/dokumen" className="flex items-center gap-1 text-slate-400 transition-colors hover:text-white">
                  Dokumen Organisasi <ArrowUpRight className="size-3 text-slate-500" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Sekretariat BEM</h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#E11D74]" />
                <span>Gedung Fakultas Keguruan dan Ilmu Pendidikan, Universitas Ibn Khaldun, Jl. KH. Sholeh Iskandar Km. 2, Kota Bogor 16162</span>
              </div>
              <Link href="/kontak" className="flex items-center gap-2 transition-colors hover:text-white">
                <Mail className="size-4 shrink-0 text-[#E11D74]" /> Hubungi BEM FKIP
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} BEM FKIP Universitas Ibn Khaldun Bogor. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="/kebijakan-privasi" className="transition-colors hover:text-slate-300">Kebijakan Privasi</Link>
            <span>•</span>
            <Link href="/syarat-ketentuan" className="transition-colors hover:text-slate-300">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

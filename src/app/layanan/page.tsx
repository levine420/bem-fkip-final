import Link from "next/link";
import { MessageSquareText, LogIn, ShieldCheck } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

export default function ServicesPage() {
  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Layanan Mahasiswa"
        title="Layanan Digital yang Dapat Dilacak"
        description="Layanan mahasiswa ditempatkan di Portal setelah login agar data pribadi dan status layanan tetap privat dan aman."
        breadcrumbs={[{ label: "Layanan" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-5">
        {/* Bank Aspirasi card */}
        <Link
          href="/layanan/bank-aspirasi"
          className="group block p-6 bg-white rounded-xl border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-pink-50 text-[#E11D74] flex items-center justify-center shrink-0">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-900 group-hover:text-[#E11D74] transition-colors">
                Bank Aspirasi
              </h2>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-2xl">
                Aspirasi, aduan, dan saran mahasiswa dikelola privat. Hanya mahasiswa pengaju serta Admin Advokesma/Super Admin yang dapat melihat isinya.
              </p>
            </div>
            <span className="text-[#E11D74] font-bold text-sm shrink-0 group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
        </Link>

        {/* Info box */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#BE185D] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Perlu Login untuk Mengakses</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Layanan pengajuan aspirasi dan pelaporan diakses melalui Portal Mahasiswa setelah login menggunakan NIM dan password.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#E11D74] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#BE185D] transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </Link>
        </div>
      </div>
    </PublicPageFrame>
  );
}

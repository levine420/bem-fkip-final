import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <div className="glass max-w-xl rounded-3xl p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Tautan yang dibuka tidak tersedia atau sudah berubah.</p>
        <Link href="/" className="bg-brand focus-ring mt-6 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold">Kembali ke Beranda</Link>
      </div>
    </main>
  );
}

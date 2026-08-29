"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <div className="glass max-w-xl rounded-3xl p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-danger">Error</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold">Terjadi kesalahan saat memuat halaman</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Coba muat ulang bagian ini. Detail teknis tidak ditampilkan kepada pengguna akhir.</p>
        <button type="button" onClick={reset} className="bg-brand focus-ring mt-6 min-h-11 rounded-full px-5 text-sm font-semibold">Muat Ulang</button>
      </div>
    </main>
  );
}

export default function BeritaLoading() {
  return (
    <main role="status" aria-label="Memuat berita" className="min-h-screen bg-background px-4 pt-16 sm:px-6">
      <div className="mx-auto max-w-7xl ">
        <div className="h-4 w-36 rounded-full bg-muted" />
        <div className="mt-5 h-12 max-w-2xl rounded-2xl bg-muted" />
        <div className="mt-4 h-5 max-w-xl rounded-xl bg-muted" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-3xl border border-glass-border bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-background px-4 pt-36 sm:px-6">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-4 w-36 rounded-full bg-white/10" />
        <div className="mt-5 h-12 max-w-2xl rounded-2xl bg-white/10" />
        <div className="mt-4 h-5 max-w-xl rounded-xl bg-white/5" />
        <div className="mt-10 h-64 rounded-3xl border border-glass-border bg-white/[0.03]" />
      </div>
    </main>
  );
}

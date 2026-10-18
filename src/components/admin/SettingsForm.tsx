import Image from "next/image";
export function SettingsForm() {
  return <section className="glass mx-auto max-w-4xl rounded-2xl p-6">
    <h2 className="text-xl font-bold">Banner Beranda</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Foto kabinet digunakan sebagai latar utama Beranda. Penyimpanan pengaturan banner melalui Admin belum tersedia.</p>
    <div className="relative mt-6 aspect-video overflow-hidden rounded-xl">
      <Image src="/images/kepengurusan-altiora.jpg" alt="Foto kabinet yang digunakan di Beranda" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
    </div>
    <p role="status" className="mt-5 rounded-lg border bg-muted p-4 text-sm text-muted-foreground">Pengaturan ini hanya dapat dilihat. Tidak ada perubahan yang disimpan dari halaman ini.</p>
  </section>;
}

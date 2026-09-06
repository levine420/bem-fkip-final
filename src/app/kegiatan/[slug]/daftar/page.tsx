"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { PublicPageHero } from "@/components/PublicPageHero";

export default function EventRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [prodi, setProdi] = useState("Pendidikan Bahasa Inggris");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [studyPrograms, setStudyPrograms] = useState<{ id: string; name: string; code: string }[]>([]);

  useEffect(() => {
    fetch("/api/public/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.student) {
          setName(data.student.name || "");
          setNim(data.student.nim || "");
          setEmail(data.student.email || "");
          if (data.student.program_studi_name) {
            setProdi(data.student.program_studi_name);
          }
        }
      })
      .catch(() => {});

    fetch("/api/public/study-programs")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setStudyPrograms(data.data);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, nim, email, prodi, notes }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal melakukan pendaftaran kegiatan.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat pendaftaran. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicPageFrame>
      <PublicPageHero
        eyebrow="Pendaftaran Kegiatan"
        title="Formulir Pendaftaran Event"
        description="Isi formulir pendaftaran di bawah ini untuk mendaftar sebagai peserta kegiatan BEM FKIP UIKA Bogor."
        breadcrumbs={[
          { label: "Kegiatan", href: "/kegiatan" },
          { label: slug, href: `/kegiatan/${slug}` },
          { label: "Form Pendaftaran" },
        ]}
      />

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {submitted ? (
            <div className="glass rounded-3xl p-8 text-center border-accent/40 shadow-2xl">
              <div className="mx-auto size-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4 border border-green-500/30">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">Pendaftaran Berhasil!</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Data pendaftaran Anda untuk kegiatan <span className="text-accent font-semibold">{slug}</span> telah tersimpan di database BEM FKIP UIKA dan sudah masuk ke Admin Panel.
              </p>
              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-glass-border text-left text-xs space-y-2 font-mono">
                <p><span className="text-muted-foreground">Nama:</span> <strong className="text-white">{name}</strong></p>
                <p><span className="text-muted-foreground">NIM:</span> <strong className="text-white">{nim}</strong></p>
                <p><span className="text-muted-foreground">Program Studi:</span> <strong className="text-white">{prodi}</strong></p>
                <p><span className="text-muted-foreground">Status Pendaftaran:</span> <strong className="text-green-400">TERDAFTAR (MENUNGGU KONFIRMASI)</strong></p>
              </div>
              <div className="mt-8 flex justify-center gap-3">
                <Link href="/portal/kegiatan" className="focus-ring rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
                  Cek di Portal Mahasiswa
                </Link>
                <Link href="/admin/layanan/kegiatan" className="focus-ring rounded-full border border-glass-border px-5 py-2.5 text-sm font-semibold hover:border-accent">
                  Cek di Admin Panel
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-glass-border pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Data Peserta Mahasiswa</h3>
                  <p className="text-xs text-muted-foreground">Pastikan data yang dimasukkan sesuai dengan KTM Anda.</p>
                </div>
                <span className="rounded-full bg-accent/20 text-accent font-semibold px-3 py-1 text-xs">
                  Sesi Terverifikasi
                </span>
              </div>

              {errorMsg && (
                <div role="alert" className="glass rounded-2xl border-danger/50 p-4 text-sm text-soft">
                  {errorMsg}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm font-medium">
                  Nama Lengkap Mahasiswa *
                  <input
                    type="text"
                    required
                    className="form-control mt-1.5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap..."
                  />
                </label>

                <label className="text-sm font-medium">
                  NIM (Nomor Induk Mahasiswa) *
                  <input
                    type="text"
                    required
                    className="form-control mt-1.5"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 231108010001"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm font-medium">
                  Email Mahasiswa UIKA *
                  <input
                    type="email"
                    required
                    className="form-control mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m.alfi@uika-bogor.ac.id"
                  />
                </label>

                <label className="text-sm font-medium">
                  Program Studi *
                  <select
                    className="form-control mt-1.5"
                    value={prodi}
                    onChange={(e) => setProdi(e.target.value)}
                  >
                    {studyPrograms.length > 0 ? (
                      studyPrograms.map((sp) => (
                        <option key={sp.id} value={sp.name}>
                          {sp.name} ({sp.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Pendidikan Bahasa Inggris">Pendidikan Bahasa Inggris (PBI)</option>
                        <option value="Pendidikan Matematika">Pendidikan Matematika (PMAT)</option>
                        <option value="Pendidikan Masyarakat / Pendidikan Luar Sekolah">Pendidikan Masyarakat / Pendidikan Luar Sekolah (PLS)</option>
                        <option value="Teknologi Pendidikan">Teknologi Pendidikan (TP)</option>
                        <option value="Pendidikan Vokasional Desain Fashion">Pendidikan Vokasional Desain Fashion (PVDF)</option>
                      </>
                    )}
                  </select>
                </label>
              </div>

              <label className="text-sm font-medium">
                Catatan Tambahan / Motivasi Mengikuti Acara
                <textarea
                  className="form-control mt-1.5 h-24"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan alasan atau catatan tambahan jika ada..."
                />
              </label>

              <div className="pt-4 flex items-center justify-between gap-4 border-t border-glass-border">
                <Link href="/kegiatan" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white">
                  <ArrowLeft className="size-4" /> Batal
                </Link>

                <button
                  type="submit"
                  disabled={busy}
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
                >
                  {busy ? "Memproses Pendaftaran…" : <><Send className="size-4" /> Kirim Pendaftaran Sekarang</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </PublicPageFrame>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";

interface StudyProgram {
  id: string;
  code: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nim: "",
    program_studi_id: "",
    angkatan: "2023",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch("/api/public/study-programs", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setStudyPrograms(data.data);
          setFormData((prev) => ({ ...prev, program_studi_id: data.data[0].id }));
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/public/auth/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          nim: formData.nim,
          program_studi_id: formData.program_studi_id,
          angkatan: Number(formData.angkatan) || 2023,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Gagal mendaftarkan akun mahasiswa.");
      }

      router.push("/portal/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Pendaftaran Mahasiswa"
      title="Buat akun Portal Mahasiswa"
      description="Lengkapi data mahasiswa Anda untuk mendapatkan akses layanan BEM FKIP UIKA."
      footer={
        <span>
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-accent hover:underline">
            Masuk
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-500 sm:col-span-2">
            {errorMsg}
          </div>
        )}

        <label className="text-sm font-semibold sm:col-span-2">
          Nama Lengkap *
          <input
            name="name"
            className="form-control mt-2"
            placeholder="Ahmad Mahasiswa"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <label className="text-sm font-semibold">
          Email *
          <input
            name="email"
            type="email"
            className="form-control mt-2"
            placeholder="mahasiswa@uika-bogor.ac.id"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <label className="text-sm font-semibold">
          NIM *
          <input
            name="nim"
            className="form-control mt-2"
            placeholder="23110001"
            value={formData.nim}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <label className="text-sm font-semibold">
          Program Studi *
          <select
            name="program_studi_id"
            className="form-control mt-2"
            value={formData.program_studi_id}
            onChange={handleChange}
            required
            disabled={loading}
          >
            {studyPrograms.length === 0 && <option value="">Loading prodi...</option>}
            {studyPrograms.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name} ({sp.code})
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold">
          Angkatan *
          <input
            name="angkatan"
            type="number"
            className="form-control mt-2"
            placeholder="2023"
            value={formData.angkatan}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <label className="text-sm font-semibold">
          Password *
          <input
            name="password"
            type="password"
            className="form-control mt-2"
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <label className="text-sm font-semibold">
          Konfirmasi Password *
          <input
            name="confirmPassword"
            type="password"
            className="form-control mt-2"
            placeholder="Ulangi password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-brand hover:bg-brand-dark min-h-12 rounded-full px-5 text-sm font-semibold text-white transition disabled:opacity-50 sm:col-span-2"
        >
          {loading ? "Mendaftarkan Akun..." : "Daftar Akun Mahasiswa"}
        </button>
      </form>
    </AuthShell>
  );
}

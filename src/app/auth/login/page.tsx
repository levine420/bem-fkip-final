"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Gagal masuk. Periksa kredensial Anda.");
      }

      router.push("/portal/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Portal Mahasiswa"
      title="Masuk ke akun mahasiswa"
      description="Gunakan email dan password akun mahasiswa FKIP UIKA Anda."
      footer={
        <span>
          Belum punya akun?{" "}
          <Link href="/auth/daftar" className="text-accent hover:underline">
            Daftar mahasiswa
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-500">
            {errorMsg}
          </div>
        )}

        <label className="text-sm font-semibold">
          Email Mahasiswa
          <input
            className="form-control mt-2"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label className="text-sm font-semibold">
          Password
          <input
            className="form-control mt-2"
            type="password"
            placeholder="Masukkan password Anda"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-brand hover:bg-brand-dark min-h-12 rounded-full px-5 text-sm font-semibold text-white transition disabled:opacity-50"
        >
          {loading ? "Memproses Login..." : "Masuk ke Portal"}
        </button>

        <Link
          href="/admin/login"
          className="focus-ring text-center text-xs text-muted-foreground hover:text-accent mt-2"
        >
          Login pengurus BEM melalui halaman Admin
        </Link>
      </form>
    </AuthShell>
  );
}

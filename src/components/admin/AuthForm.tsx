"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { actionClass, adminApi, errorMessage } from "./api";
import { Eye, EyeOff } from "lucide-react";

export function AdminAuthForm({ changePassword = false }: { changePassword?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("admin@bemfkip.uika.ac.id");
  const [passwordVal, setPasswordVal] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    const fields = changePassword
      ? Object.fromEntries(new FormData(event.currentTarget))
      : { email: email.trim(), password: passwordVal };

    try {
      const result = await adminApi<{ redirect: string }>(
        `/api/admin/auth/${changePassword ? "password" : "login"}`,
        "POST",
        fields
      );
      window.location.assign(result.redirect);
    } catch (cause) {
      setError(errorMessage(cause));
      setBusy(false);
    }
  }

  const fillDefaultAdmin = () => {
    setEmail("admin@bemfkip.uika.ac.id");
    setPasswordVal("SuperAdmin2024!");
    setError("");
  };

  return (
    <form onSubmit={submit} className="grid gap-4" aria-busy={busy}>
      {changePassword ? (
        <label className="text-sm font-semibold">
          Password saat ini
          <input
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
            className="form-control mt-2"
          />
        </label>
      ) : (
        <label className="text-sm font-semibold">
          Email Admin / Super Admin
          <input
            name="email"
            type="email"
            maxLength={100}
            autoComplete="username"
            placeholder="admin@bemfkip.uika.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control mt-2"
          />
        </label>
      )}

      <div className="relative">
        <label className="text-sm font-semibold block">
          {changePassword ? "Password baru" : "Password"}
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={changePassword ? "new-password" : "current-password"}
            minLength={changePassword ? 12 : 1}
            value={changePassword ? undefined : passwordVal}
            onChange={changePassword ? undefined : (e) => setPasswordVal(e.target.value)}
            required
            className="form-control mt-2 pr-10"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
          title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {!changePassword && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={fillDefaultAdmin}
            className="text-xs font-semibold text-accent hover:underline focus-ring rounded"
          >
            Isi Otomatis Kredensial Super Admin BEM
          </button>
        </div>
      )}

      {changePassword && (
        <>
          <p className="text-xs text-muted-foreground">
            Minimal 12 karakter dengan huruf besar, kecil, dan angka; maksimal 72 byte. Sesi sebelumnya akan dicabut.
          </p>
          <label className="text-sm font-semibold">
            Konfirmasi password baru
            <input
              name="confirmation"
              type="password"
              autoComplete="new-password"
              required
              className="form-control mt-2"
            />
          </label>
        </>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-500 space-y-1">
          <p className="font-bold">{error}</p>
          {!changePassword && (
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              * Pastikan huruf besar & kecil password tepat (<code>SuperAdmin2024!</code>). Jika Anda mahasiswa, silakan masuk di{" "}
              <Link href="/auth/login" className="text-accent underline font-semibold">
                Portal Mahasiswa
              </Link>.
            </p>
          )}
        </div>
      )}

      <button className={`${actionClass} bg-brand font-semibold text-white`} disabled={busy}>
        {busy ? "Memproses…" : changePassword ? "Simpan password baru" : "Masuk Admin"}
      </button>

      <p className="text-xs text-muted-foreground">
        Sesi berakhir setelah 60 menit tanpa aktivitas. Password bawaan: <code className="text-accent">SuperAdmin2024!</code>
      </p>
    </form>
  );
}

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <button
        className={actionClass}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const result = await adminApi<{ redirect: string }>("/api/admin/auth/logout", "POST");
            window.location.assign(result.redirect);
          } catch (cause) {
            setError(errorMessage(cause));
            setBusy(false);
          }
        }}
      >
        {busy ? "Keluar…" : "Keluar"}
      </button>
      {error && <p role="alert" className="text-sm text-soft">{error}</p>}
    </div>
  );
}

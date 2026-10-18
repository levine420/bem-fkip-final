"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useRef, useState } from "react";

export function StudentLogoutButton() {
  const router = useRouter();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/public/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout gagal. Silakan coba lagi.");
      router.push("/auth/login");
      router.refresh();
    } catch {
      setError("Belum berhasil keluar. Periksa koneksi dan coba lagi.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  return (
    <div><button type="button" disabled={busy}
      onClick={handleLogout}
      className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-center text-xs font-semibold text-red-500 hover:bg-red-500/20 transition"
    >
      <LogOut className="h-3.5 w-3.5" /> {busy ? "Sedang keluar…" : "Logout Mahasiswa"}
    </button>{error && <p role="alert" className="mt-2 text-xs">{error}</p>}</div>
  );
}

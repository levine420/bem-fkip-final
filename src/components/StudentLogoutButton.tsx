"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function StudentLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/public/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch {
      router.push("/auth/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-center text-xs font-semibold text-red-500 hover:bg-red-500/20 transition"
    >
      <LogOut className="h-3.5 w-3.5" /> Logout Mahasiswa
    </button>
  );
}

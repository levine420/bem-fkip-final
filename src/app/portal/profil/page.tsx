"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalPage } from "@/components/PortalPage";
import { ImageUploader } from "@/components/ImageUploader";
import { User, Lock, Save, CheckCircle2 } from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  email: string;
  nim: string | null;
  angkatan: number | null;
  program_studi_name?: string | null;
  avatar_url: string | null;
  account_status: string;
}

export default function PortalProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form profile states
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Form password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 detik timeout

    fetch("/api/public/auth/me", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.student) {
          setStudent(data.student);
          setName(data.student.name);
          setAvatarUrl(data.student.avatar_url || "");
        } else {
          router.push("/auth/login");
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          router.push("/auth/login");
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSubmitting(true);

    try {
      const res = await fetch("/api/public/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar_url: avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal memperbarui profil.");

      setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
      if (student) setStudent({ ...student, name, avatar_url: avatarUrl });
      router.refresh();
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Gagal memperbarui profil." });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Konfirmasi password baru tidak cocok." });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password baru minimal 8 karakter." });
      return;
    }

    setPasswordSubmitting(true);

    try {
      const res = await fetch("/api/public/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal mengganti password.");

      setPasswordMsg({ type: "success", text: "Password berhasil diganti!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Gagal mengganti password." });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PortalPage activeHref="/portal/profil" title="Profil Mahasiswa" description="Mengambil data akun mahasiswa...">
        <div className="p-12 text-center text-xs text-muted-foreground">Memuat data profil...</div>
      </PortalPage>
    );
  }

  if (!student) return null;

  return (
    <PortalPage
      activeHref="/portal/profil"
      title="Profil Mahasiswa"
      description="Kelola informasi akun dan kata sandi akun mahasiswa FKIP UIKA Anda."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Info Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Informasi Akun</h4>
              <p className="text-xs text-muted-foreground">Nama, NIM, dan identitas akademik mahasiswa.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileMsg && (
              <div
                className={`rounded-xl p-3 text-xs ${
                  profileMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                    : "bg-red-500/10 border border-red-500/20 text-red-500"
                }`}
              >
                {profileMsg.text}
              </div>
            )}

            <label className="block text-sm font-semibold">
              Nama Lengkap
              <input
                className="form-control mt-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={profileSubmitting}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                NIM (Terkunci)
                <input className="form-control mt-2 bg-muted/50" value={student.nim || "-"} disabled />
              </label>

              <label className="block text-sm font-semibold">
                Email (Terkunci)
                <input className="form-control mt-2 bg-muted/50" value={student.email} disabled />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Program Studi
                <input
                  className="form-control mt-2 bg-muted/50"
                  value={student.program_studi_name || "FKIP UIKA"}
                  disabled
                />
              </label>

              <label className="block text-sm font-semibold">
                Angkatan
                <input className="form-control mt-2 bg-muted/50" value={student.angkatan || "-"} disabled />
              </label>
            </div>

            <ImageUploader
              label="Foto Profil Mahasiswa"
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url)}
              apiEndpoint="/api/public/upload"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-dark transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {profileSubmitting ? "Menyimpan..." : "Simpan Perubahan Profil"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Ganti Password</h4>
              <p className="text-xs text-muted-foreground">Perbarui kata sandi akun secara berkala untuk keamanan.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordMsg && (
              <div
                className={`rounded-xl p-3 text-xs ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                    : "bg-red-500/10 border border-red-500/20 text-red-500"
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <label className="block text-sm font-semibold">
              Password saat ini
              <input
                type="password"
                className="form-control mt-2"
                placeholder="Password lama Anda"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={passwordSubmitting}
              />
            </label>

            <label className="block text-sm font-semibold">
              Password Baru
              <input
                type="password"
                className="form-control mt-2"
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={passwordSubmitting}
              />
            </label>

            <label className="block text-sm font-semibold">
              Konfirmasi Password Baru
              <input
                type="password"
                className="form-control mt-2"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={passwordSubmitting}
              />
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-xs font-semibold text-background shadow-xs hover:bg-foreground/90 transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {passwordSubmitting ? "Mengganti..." : "Ganti Password Mahasiswa"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalPage>
  );
}

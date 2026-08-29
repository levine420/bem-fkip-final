"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Save, CheckCircle2, ImageIcon } from "lucide-react";

export function SettingsForm() {
  const [heroBannerUrl, setHeroBannerUrl] = useState("/images/hero-banner.png");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSaved(false);

    // Simulate saving configuration
    setTimeout(() => {
      setSaved(true);
      setBusy(false);
    }, 500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> Pengaturan banner visual berhasil diperbarui!
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Visual Hero Banner Homepage</h4>
            <p className="text-xs text-muted-foreground">
              Ganti atau unggah banner utama yang tampil di halaman depan website BEM FKIP UIKA.
            </p>
          </div>
        </div>

        <ImageUploader
          label="File Gambar Banner Utama Homepage"
          value={heroBannerUrl}
          onChange={(url) => setHeroBannerUrl(url)}
          placeholder="Unggah berkas foto dari Laptop/HP atau tempelkan link URL HTTPS"
        />

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-dark transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {busy ? "Menyimpan..." : "Simpan Pengaturan Banner"}
          </button>
        </div>
      </form>
    </div>
  );
}

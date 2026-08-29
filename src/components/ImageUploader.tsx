"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Link as LinkIcon, X, CheckCircle, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  apiEndpoint?: string;
  placeholder?: string;
}

export function ImageUploader({
  label = "Banner / Foto Gambar",
  value,
  onChange,
  apiEndpoint = "/api/admin/upload",
  placeholder = "Unggah file dari perangkat atau masukkan URL gambar",
}: ImageUploaderProps) {
  const [tab, setTab] = useState<"file" | "url">("file");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Pilih file gambar (JPG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran gambar terlalu besar. Maksimal 5 MB.");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Gagal mengunggah gambar dari perangkat.");
      }

      onChange(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah berkas.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-semibold text-foreground">{label}</label>}

      {/* Image Preview Box if value exists */}
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-card p-3 shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={value}
                  alt="Preview Banner"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <CheckCircle className="h-3.5 w-3.5" /> Gambar Terpasang
                </span>
                <p className="truncate text-xs text-muted-foreground max-w-xs">{value}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                Lihat Foto
              </a>
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition"
              >
                <X className="h-3.5 w-3.5" /> Hapus / Ganti
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <button
              type="button"
              onClick={() => setTab("file")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                tab === "file"
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="h-3.5 w-3.5" /> Upload dari Perangkat
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                tab === "url"
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" /> Gunakan Link URL
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
              {errorMsg}
            </div>
          )}

          {tab === "file" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                dragOver
                  ? "border-brand bg-brand/10"
                  : "border-border hover:border-brand/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-brand">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-xs font-semibold">Mengunggah gambar dari perangkat...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">
                      Klik untuk pilih gambar dari Laptop/HP
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      Atau tarik dan lepas file gambar ke sini (Maks 5 MB: JPG, PNG, WEBP, GIF)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {placeholder}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { actionClass, adminApi, ApiError, errorMessage } from "./api";
import { ImageUploader } from "@/components/ImageUploader";

type Content = {
  id: string;
  title: string;
  slug: string;
  seo_slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  body: string;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  status: string;
  review_note: string | null;
  author: { id: string; name: string };
  department: { id: string; name: string } | null;
};

type EditorData = {
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  category: string;
  tags: string;
  thumbnail_url: string;
  meta_title: string;
  meta_description: string;
};

const emptyEditor: EditorData = {
  title: "",
  slug: "",
  body: "",
  excerpt: "",
  category: "BERITA",
  tags: "",
  thumbnail_url: "",
  meta_title: "",
  meta_description: "",
};

export function ContentEditor({ mode, contentId }: { mode: "create" | "edit"; contentId?: string }) {
  const router = useRouter();
  const [existing, setExisting] = useState<Content | null>(null);
  const [editor, setEditor] = useState<EditorData>(emptyEditor);
  const [loading, setLoading] = useState(mode === "edit" && Boolean(contentId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (mode === "edit") {
      if (!contentId) {
        setLoading(false);
        setError("ID Konten tidak valid.");
        return;
      }

      let live = true;
      setLoading(true);
      setError("");

      adminApi<Content>(`/api/admin/contents/${contentId}`)
        .then((content) => {
          if (!live) return;
          setExisting(content);
          setEditor({
            title: content.title,
            slug: content.slug,
            body: content.body,
            excerpt: content.excerpt || "",
            category: content.category,
            tags: content.tags ? content.tags.join(", ") : "",
            thumbnail_url: content.thumbnail_url || "",
            meta_title: content.meta_title || "",
            meta_description: content.meta_description || "",
          });
        })
        .catch((cause) => {
          if (live) setError(errorMessage(cause));
        })
        .finally(() => {
          if (live) setLoading(false);
        });

      return () => {
        live = false;
      };
    }
  }, [mode, contentId]);

  async function save(event: FormEvent<HTMLFormElement>, submitReview = false) {
    event.preventDefault();
    if (busy) return;
    
    setBusy(true);
    setError("");
    setFields({});
    
    const tags = editor.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    
    const payload = {
      title: editor.title,
      slug: editor.slug || undefined,
      body: editor.body,
      excerpt: editor.excerpt || undefined,
      category: editor.category,
      tags,
      thumbnail_url: editor.thumbnail_url || undefined,
      meta_title: editor.meta_title || undefined,
      meta_description: editor.meta_description || undefined,
    };
    
    try {
      if (mode === "create") {
        const result = await adminApi<Content>("/api/admin/contents", "POST", payload);
        if (submitReview) {
          await adminApi(`/api/admin/contents/${result.id}/submit`, "POST");
          router.push("/admin/konten?submitted=true");
        } else {
          router.push("/admin/konten?created=true");
        }
      } else if (mode === "edit" && contentId) {
        await adminApi(`/api/admin/contents/${contentId}`, "PATCH", payload);
        if (submitReview) {
          await adminApi(`/api/admin/contents/${contentId}/submit`, "POST");
          router.push("/admin/konten?submitted=true");
        } else {
          router.push("/admin/konten?updated=true");
        }
      }
    } catch (cause) {
      setError(errorMessage(cause));
      if (cause instanceof ApiError) {
        setFields(cause.fields ?? {});
      }
    } finally {
      setBusy(false);
    }
  }

  function field(
    key: keyof EditorData,
    label: string,
    props?: {
      multiline?: boolean;
      rows?: number;
      placeholder?: string;
      maxLength?: number;
      type?: string;
    }
  ) {
    const { multiline = false, rows = 3, placeholder = "", maxLength = 1000, type = "text" } = props || {};
    
    const inputProps = {
      id: `content-${key}`,
      name: key,
      value: editor[key],
      disabled: busy || loading,
      required: ["title", "body", "category"].includes(key),
      "aria-invalid": !!fields[key],
      "aria-describedby": fields[key] ? `error-${key}` : undefined,
      className: "form-control mt-2",
      placeholder,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setEditor({ ...editor, [key]: e.target.value }),
    };
    
    return (
      <div>
        <label htmlFor={`content-${key}`} className="text-sm font-semibold">
          {label}
        </label>
        {key === "category" ? (
          <select {...inputProps}>
            <option value="BERITA">Berita</option>
            <option value="PENGUMUMAN">Pengumuman</option>
            <option value="KAJIAN">Kajian</option>
            <option value="RILIS_PERS">Rilis Pers</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
        ) : multiline ? (
          <textarea {...inputProps} rows={rows} maxLength={maxLength} />
        ) : (
          <input {...inputProps} type={type} maxLength={maxLength} />
        )}
        {fields[key] && (
          <p id={`error-${key}`} className="mt-1 text-xs text-soft">
            {fields[key]}
          </p>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass rounded-3xl p-5 sm:p-7">
        <p className="text-center text-sm text-muted-foreground">Memuat konten…</p>
      </div>
    );
  }

  if (mode === "edit" && error && !existing) {
    return (
      <div className="glass rounded-3xl p-5 sm:p-7">
        <p className="text-sm text-soft">{error}</p>
        <button className={`${actionClass} mt-4`} onClick={() => router.back()}>
          Kembali
        </button>
      </div>
    );
  }

  const canSubmitReview = mode === "create" || (existing && ["DRAF", "REVISI"].includes(existing.status));

  return (
    <div className="grid gap-4">
      {existing && existing.status === "REVISI" && existing.review_note && (
        <div className="glass rounded-3xl border-orange-500/50 p-5 sm:p-7">
          <h3 className="font-semibold text-orange-400">Catatan Revisi dari Super Admin</h3>
          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{existing.review_note}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="glass rounded-2xl border-danger/50 p-4">
          <p className="text-sm text-soft">{error}</p>
        </div>
      )}

      <form className="glass grid gap-4 rounded-3xl p-5 sm:p-7" onSubmit={(e) => save(e, false)} aria-busy={busy}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Buat Konten Baru" : "Edit Konten"}
          </h2>
          <button
            type="button"
            className={`${actionClass} text-sm`}
            onClick={() => setPreview(!preview)}
            disabled={busy}
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        {!preview ? (
          <>
            {field("title", "Judul *", { maxLength: 200, placeholder: "Judul konten..." })}
            {field("slug", "Slug URL", {
              maxLength: 200,
              placeholder: "Kosongkan untuk auto-generate dari judul",
            })}
            
            <div className="grid gap-4 sm:grid-cols-2">
              {field("category", "Kategori *")}
              {field("tags", "Tags", {
                placeholder: "Pisahkan dengan koma: pendidikan, mahasiswa, bem",
                maxLength: 500,
              })}
            </div>

            {field("excerpt", "Excerpt", {
              multiline: true,
              rows: 3,
              maxLength: 1000,
              placeholder: "Ringkasan singkat konten (opsional)...",
            })}

            {field("body", "Konten *", {
              multiline: true,
              rows: 15,
              maxLength: 100000,
              placeholder: "Tulis konten di sini. Mendukung HTML basic...",
            })}

            <ImageUploader
              label="Foto Banner / Thumbnail Artikel Berita"
              value={editor.thumbnail_url}
              onChange={(url) => setEditor((prev) => ({ ...prev, thumbnail_url: url }))}
            />

            <button
              type="button"
              className={`${actionClass} text-sm`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Sembunyikan" : "Tampilkan"} Pengaturan SEO
            </button>

            {showAdvanced && (
              <div className="grid gap-4 rounded-2xl border border-glass-border p-4">
                <p className="text-xs text-muted-foreground">
                  Pengaturan SEO opsional untuk optimasi mesin pencari
                </p>
                {field("meta_title", "Meta Title", {
                  maxLength: 255,
                  placeholder: "Judul untuk mesin pencari (opsional)",
                })}
                {field("meta_description", "Meta Description", {
                  multiline: true,
                  rows: 3,
                  maxLength: 1000,
                  placeholder: "Deskripsi untuk mesin pencari (opsional)",
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button className={`${actionClass} bg-brand`} disabled={busy}>
                {busy ? "Menyimpan…" : "Simpan sebagai Draf"}
              </button>
              {canSubmitReview && (
                <button
                  type="button"
                  className={`${actionClass} bg-accent`}
                  disabled={busy}
                  onClick={(e) => {
                    if (
                      window.confirm(
                        "Submit konten untuk review?\n\nKonten tidak dapat diedit setelah disubmit."
                      )
                    ) {
                      save(e as any, true);
                    }
                  }}
                >
                  Simpan & Submit Review
                </button>
              )}
              <button
                className={actionClass}
                type="button"
                disabled={busy}
                onClick={() => router.back()}
              >
                Batal
              </button>
            </div>
          </>
        ) : (
          <div className="grid gap-4">
            <div>
              <p className="text-xs text-muted-foreground">JUDUL</p>
              <h3 className="mt-1 text-2xl font-bold">{editor.title || "(Belum ada judul)"}</h3>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">KATEGORI</p>
              <p className="mt-1">{editor.category}</p>
            </div>
            {editor.excerpt && (
              <div>
                <p className="text-xs text-muted-foreground">EXCERPT</p>
                <p className="mt-1 text-sm text-muted-foreground">{editor.excerpt}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">KONTEN</p>
              <div
                className="prose prose-invert mt-2 max-w-none"
                dangerouslySetInnerHTML={{ __html: editor.body || "(Belum ada konten)" }}
              />
            </div>
            {editor.tags && (
              <div>
                <p className="text-xs text-muted-foreground">TAGS</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {editor.tags.split(",").map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-glass-border px-3 py-1 text-xs"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

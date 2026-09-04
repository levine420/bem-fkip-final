"use client";
export class ApiError extends Error {
  status: number; code: string; fields?: Record<string, string>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message); this.status = status; this.code = code; this.fields = fields;
  }
}
export async function adminApi<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  let csrf: string | undefined;
  if (method !== "GET") {
    const csrfRes = await fetch("/api/admin/auth/csrf", { cache: "no-store", credentials: "same-origin" });
    let tokenData: any = {};
    try {
      tokenData = await csrfRes.json();
    } catch {
      throw new Error("Sesi formulir gagal dimuat. Silakan muat ulang halaman.");
    }
    if (!csrfRes.ok || !tokenData.data?.csrf) throw new Error("Sesi formulir gagal dimuat. Silakan muat ulang.");
    csrf = tokenData.data.csrf;
  }

  const response = await fetch(path, {
    method,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let result: any = {};
  const responseText = await response.text();
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    if (!response.ok) {
      if (response.status === 413) {
        throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Ukuran file/gambar terlalu besar untuk disimpan.");
      }
      throw new ApiError(response.status, "SERVER_ERROR", `Terjadi kesalahan pada server (${response.status}).`);
    }
    result = {};
  }

  if (!response.ok) {
    if (result.error?.code === "SESSION_INVALID" || result.error?.code === "ASSIGNMENT_INACTIVE") {
      window.location.assign("/admin/login");
    }
    if (result.error?.code === "PASSWORD_CHANGE_REQUIRED") {
      window.location.assign("/admin/ganti-password");
    }
    throw new ApiError(
      response.status,
      result.error?.code ?? "ERROR",
      result.error?.message ?? "Permintaan gagal.",
      result.error?.fields
    );
  }
  return result.data as T;
}
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi."; }
export const actionClass = "focus-ring min-h-11 rounded-xl border border-glass-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50";

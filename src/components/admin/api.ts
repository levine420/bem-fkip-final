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
    const response = await fetch("/api/admin/auth/csrf", { cache: "no-store", credentials: "same-origin" });
    const token = await response.json();
    if (!response.ok || !token.data?.csrf) throw new Error("Sesi formulir gagal dimuat. Coba lagi.");
    csrf = token.data.csrf;
  }
  const response = await fetch(path, { method, cache: "no-store", credentials: "same-origin",
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(csrf ? { "X-CSRF-Token": csrf } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) {
    if (result.error?.code === "SESSION_INVALID" || result.error?.code === "ASSIGNMENT_INACTIVE") window.location.assign("/admin/login");
    if (result.error?.code === "PASSWORD_CHANGE_REQUIRED") window.location.assign("/admin/ganti-password");
    throw new ApiError(response.status, result.error?.code ?? "ERROR", result.error?.message ?? "Permintaan gagal.", result.error?.fields);
  }
  return result.data as T;
}
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi."; }
export const actionClass = "focus-ring min-h-11 rounded-xl border border-glass-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50";

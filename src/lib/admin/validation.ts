import { AdminError } from "./errors.ts";
export function objectInput(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AdminError(422, "VALIDATION", "Format data tidak valid.");
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !keys.includes(key))) throw new AdminError(422, "VALIDATION", "Ada field yang tidak diizinkan.");
  return input;
}
function invalid(field: string, message: string): never {
  throw new AdminError(422, "VALIDATION", message, { [field]: message });
}
export function textField(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== "string") return invalid(field, `${field} wajib diisi.`);
  const result = value.trim();
  if (result.length < min || result.length > max) return invalid(field, `${field} harus ${min}–${max} karakter.`);
  return result;
}
export function integer(value: unknown, field: string, min: number, max: number): number {
  const n = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  if (typeof n !== "number" || !Number.isSafeInteger(n) || n < min || n > max) return invalid(field, `${field} harus bilangan bulat ${min}–${max}.`);
  return n;
}
export function uuid(value: unknown, field = "id"): string {
  if (typeof value !== "string" || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)) return invalid(field, `${field} tidak valid.`);
  return value;
}
export function email(value: unknown): string {
  const result = textField(value, "email", 3, 100).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) return invalid("email", "Format email tidak valid.");
  return result;
}
export function password(value: unknown, strong = false): string {
  if (typeof value !== "string" || value.length < 1 || Buffer.byteLength(value, "utf8") > 72) return invalid("password", "Password wajib diisi, maksimal 72 byte UTF-8.");
  if (strong && (value.length < 12 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value))) return invalid("password", "Gunakan minimal 12 karakter dengan huruf besar, kecil, dan angka.");
  return value;
}
export function periodInput(value: unknown, edit = false) {
  const input = objectInput(value, ["name", "visi", "misi", "year_start", "year_end", "photo_url", ...(edit ? ["version"] : [])]);
  const year_start = integer(input.year_start, "year_start", 1000, 9999);
  const year_end = integer(input.year_end, "year_end", year_start, 9999);
  let photo_url: string | null = null;
  if (input.photo_url !== null && input.photo_url !== undefined && input.photo_url !== "") {
    photo_url = textField(input.photo_url, "photo_url", 1, 1024);
    try {
      const url = new URL(photo_url);
      if (url.protocol !== "https:" || url.username || url.password) return invalid("photo_url", "URL foto harus HTTPS tanpa kredensial.");
    } catch { return invalid("photo_url", "URL foto tidak valid."); }
  }
  return { name: textField(input.name, "name", 3, 100), visi: textField(input.visi, "visi", 1, 500),
    misi: textField(input.misi, "misi", 1, 10000), year_start, year_end, photo_url };
}
export function pagination(params: URLSearchParams) {
  const page = integer(params.get("page") ?? 1, "page", 1, 100000);
  const q = (params.get("q") ?? "").trim();
  if (q.length > 100) return invalid("q", "Pencarian maksimal 100 karakter.");
  return { page, q, take: 20, skip: (page - 1) * 20 };
}

import { AdminError } from "./errors.ts";
import { departmentScope, requireSuperAdmin, type AdminActor } from "./policy.ts";
import { integer, objectInput, textField, uuid } from "./validation.ts";

export type OrganizationKind = "departments" | "department-members" | "board-members";
export type PeriodSummary = { id: string; name: string; status: "AKTIF" | "NONAKTIF" | "ARSIP" };
export type DepartmentSummary = { id: string; name: string };
export type OrganizationItem = { id: string; name: string; version: number } & (
  { slug: string; description: string | null; logo_url: string | null } |
  { position: string; photo_url: string | null; display_order: number; department_id: string | null; department: DepartmentSummary | null }
);
export type OrganizationResult = {
  items: OrganizationItem[]; total: number; page: number; page_size: number;
  period: PeriodSummary; can_create: boolean; can_delete: boolean; super_admin: boolean;
};
export type PeriodOptions = { items: PeriodSummary[]; total: number; page: number; page_size: number; default_period: PeriodSummary | null; super_admin: boolean };

// Never use a client filter to replace the authenticated assignment scope.
export function organizationScope(actor: AdminActor, periodId: unknown, departmentId?: unknown) {
  const scope = departmentScope(actor);
  const period_id = uuid(periodId ?? scope.period_id, "period_id");
  const requestedDepartment = departmentId == null || departmentId === "" ? undefined : uuid(departmentId, "department_id");
  if (actor.role === "ADMIN" && (period_id !== scope.period_id || (requestedDepartment && requestedDepartment !== scope.department_id))) {
    throw new AdminError(403, "FORBIDDEN", "Filter berada di luar departemen atau periode penugasan.");
  }
  return { period_id, department_id: actor.role === "ADMIN" ? scope.department_id : requestedDepartment };
}
export function requireOrganizationAccess(actor: AdminActor, kind: OrganizationKind, action: "read" | "create" | "edit" | "delete") {
  if (kind === "board-members" || (kind === "departments" && (action === "create" || action === "delete"))) requireSuperAdmin(actor);
}
export function optionalImageUrl(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  const result = textField(value, field, 1, 1024);
  try {
    const url = new URL(result);
    if (url.protocol === "https:" && !url.username && !url.password) return result;
  } catch { /* Return a field error, never fetch the URL. */ }
  throw new AdminError(422, "VALIDATION", "URL gambar harus HTTPS tanpa kredensial.", { [field]: "Gunakan URL HTTPS tanpa kredensial." });
}
export function departmentInput(value: unknown, actor: AdminActor, edit = false) {
  requireOrganizationAccess(actor, "departments", edit ? "edit" : "create");
  const privileged = actor.role === "SUPER_ADMIN";
  const input = objectInput(value, ["description", "logo_url", ...(privileged ? ["name", "slug"] : []), edit ? "version" : "period_id"]);
  const description = input.description == null || input.description === "" ? null : textField(input.description, "description", 1, 10000);
  const common = { description, logo_url: optionalImageUrl(input.logo_url, "logo_url") };
  if (!privileged) return common;
  const slug = textField(input.slug, "slug", 1, 150);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new AdminError(422, "VALIDATION", "Slug hanya huruf kecil, angka, dan tanda hubung tunggal.", { slug: "Contoh format: nama-departemen" });
  return { ...common, name: textField(input.name, "name", 3, 100), slug };
}
export function memberInput(value: unknown, board: boolean, edit = false) {
  const input = objectInput(value, ["name", "position", "photo_url", "display_order", ...(!edit || board ? ["department_id"] : []), edit ? "version" : "period_id"]);
  return {
    name: textField(input.name, "name", 3, 100), position: textField(input.position, "position", 1, 100),
    photo_url: optionalImageUrl(input.photo_url, "photo_url"), display_order: integer(input.display_order, "display_order", 1, 2147483647),
  };
}
export function memberDepartment(value: unknown, board: boolean): string | null {
  if (board && value === null) return null;
  return uuid(value, "department_id");
}
export function deleteInput(value: unknown) {
  const input = objectInput(value, ["version", "confirmed"]);
  if (input.confirmed !== true) throw new AdminError(422, "CONFIRMATION_REQUIRED", "Konfirmasi penghapusan wajib diberikan.");
  return integer(input.version, "version", 1, 2147483647);
}

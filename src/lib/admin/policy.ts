import { AdminError } from "./errors.ts";

export type AdminActor = {
  id: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
  must_change_password: boolean;
  assignment: { period_id: string; department_id: string } | null;
};
export type AccountForAccess = {
  id: string; name: string; role: string; account_status: string;
  deleted_at: Date | null; must_change_password: boolean;
  admin_assignments_user: {
    period_id: string; department_id: string; revoked_at: Date | null;
    period: { status: string }; department: { deleted_at: Date | null };
  } | null;
};
export function actorFromAccount(user: AccountForAccess): AdminActor {
  if (user.deleted_at || user.account_status !== "AKTIF" || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new AdminError(401, "SESSION_INVALID", "Sesi tidak berlaku. Silakan masuk kembali.");
  }
  const a = user.admin_assignments_user;
  if (user.role === "ADMIN" && (!a || a.revoked_at || a.period.status !== "AKTIF" || a.department.deleted_at)) {
    throw new AdminError(403, "ASSIGNMENT_INACTIVE", "Akses Admin untuk periode ini tidak aktif.");
  }
  return { id: user.id, name: user.name, role: user.role as AdminActor["role"],
    must_change_password: user.must_change_password,
    assignment: user.role === "ADMIN" && a ? { period_id: a.period_id, department_id: a.department_id } : null };
}
export function requireSuperAdmin(actor: AdminActor) {
  if (actor.role !== "SUPER_ADMIN") throw new AdminError(403, "FORBIDDEN", "Fitur ini khusus Super Admin.");
}
export function departmentScope(actor: AdminActor): { period_id?: string; department_id?: string } {
  if (actor.role === "SUPER_ADMIN") return {};
  if (!actor.assignment) throw new AdminError(403, "FORBIDDEN", "Assignment Admin tidak tersedia.");
  return { period_id: actor.assignment.period_id, department_id: actor.assignment.department_id };
}
export function assertResourceScope(actor: AdminActor, resource: { period_id: string; department_id: string | null }) {
  const scope = departmentScope(actor);
  if (actor.role === "ADMIN" && (scope.period_id !== resource.period_id || scope.department_id !== resource.department_id)) {
    throw new AdminError(403, "FORBIDDEN", "Data berada di luar kewenangan departemen lu.");
  }
}
export function assertWritablePeriod(status: string) {
  if (status !== "AKTIF" && status !== "NONAKTIF") {
    throw new AdminError(409, "PERIOD_READ_ONLY", "Periode arsip bersifat hanya baca, termasuk untuk Super Admin.");
  }
}
export function assertActivation(targetStatus: string, actualActive: string | null, expectedActive: string | null) {
  if (targetStatus !== "NONAKTIF") throw new AdminError(409, "INVALID_TRANSITION", "Hanya periode draf yang dapat diaktifkan.");
  if (actualActive !== expectedActive) throw new AdminError(409, "STALE_STATE", "Periode aktif sudah berubah. Muat ulang sebelum melanjutkan.");
}
export function assertVersion(actual: number, expected: number) {
  if (actual !== expected) throw new AdminError(409, "STALE_STATE", "Data sudah diubah. Muat ulang sebelum menyimpan.");
}

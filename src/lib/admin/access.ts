import { AdminError } from "./errors.ts";
import { email, integer, objectInput, password, textField, uuid } from "./validation.ts";

export type UserAction = "disable" | "enable" | "revoke" | "reset-password";
export type ManagedUser = {
  id: string; name: string; email: string; nim: string | null; angkatan: number | null;
  role: "ADMIN" | "SUPER_ADMIN" | "MAHASISWA"; account_status: "AKTIF" | "NONAKTIF" | "BELUM_VERIFIKASI";
  version: number; must_change_password: boolean; email_verified_at: Date | string | null; deleted_at: Date | string | null;
  study_program: { id: string; code: string; name: string } | null;
  admin_assignments_user: { id: string; period_id: string; department_id: string; revoked_at: Date | string | null;
    period: { id: string; name: string; status: string }; department: { id: string; name: string; deleted_at: Date | string | null } } | null;
};
export type UserList = { items: ManagedUser[]; total: number; page: number; page_size: number; actor_id: string };
export type StudyProgram = { id: string; code: string; name: string; version: number; _count: { users_study_program: number } };
export type StudyProgramList = { items: StudyProgram[]; total: number; page: number; page_size: number };

export function createAdminInput(value: unknown) {
  const input = objectInput(value, ["name", "email", "role", "password", "confirmation", "department_id", "period_id"]);
  if (input.role !== "ADMIN" && input.role !== "SUPER_ADMIN") throw new AdminError(422, "VALIDATION", "Hanya akun Admin atau Super Admin yang dapat dibuat.");
  const supplied = password(input.password, true);
  if (input.confirmation !== supplied) throw new AdminError(422, "VALIDATION", "Konfirmasi password tidak cocok.", { confirmation: "Konfirmasi harus sama." });
  if (input.role === "SUPER_ADMIN" && (input.department_id != null || input.period_id != null)) throw new AdminError(422, "VALIDATION", "Super Admin tidak terikat departemen/periode.");
  return { name: textField(input.name, "name", 3, 100), email: email(input.email), role: input.role, password: supplied,
    department_id: input.role === "ADMIN" ? uuid(input.department_id, "department_id") : null,
    period_id: input.role === "ADMIN" ? uuid(input.period_id, "period_id") : null };
}
export function editAdminInput(value: unknown) {
  const input = objectInput(value, ["name", "version"]);
  return { name: textField(input.name, "name", 3, 100), version: integer(input.version, "version", 1, 2147483647) };
}
export function userActionInput(action: UserAction, value: unknown) {
  const input = objectInput(value, ["version", "confirmed", "reason", ...(action === "reset-password" ? ["password", "confirmation"] : [])]);
  if (input.confirmed !== true) throw new AdminError(422, "CONFIRMATION_REQUIRED", "Konfirmasi tindakan wajib diberikan.");
  const version = integer(input.version, "version", 1, 2147483647), reason = textField(input.reason, "reason", 10, 500);
  if (action !== "reset-password") return { version, reason, password: null };
  const supplied = password(input.password, true);
  if (input.confirmation !== supplied) throw new AdminError(422, "VALIDATION", "Konfirmasi password tidak cocok.");
  return { version, reason, password: supplied };
}
function liveAssignment(user: ManagedUser) {
  const a = user.admin_assignments_user;
  if (!a || a.revoked_at || a.period.status !== "AKTIF" || a.department.deleted_at) throw new AdminError(409, "TARGET_ASSIGNMENT_INACTIVE", "Assignment Admin tidak aktif. Akses periode lama atau yang dicabut tidak dapat dipulihkan; buat akun baru bila diperlukan.");
}
export function assertUserEdit(user: ManagedUser) {
  if (user.deleted_at) throw new AdminError(404, "NOT_FOUND", "Akun tidak ditemukan.");
  if (user.role === "MAHASISWA") throw new AdminError(403, "FORBIDDEN", "Identitas mahasiswa tidak diedit melalui modul ini.");
  if (user.role === "ADMIN") liveAssignment(user);
}
export function assertUserAction(user: ManagedUser, actorId: string, action: UserAction, activeSuperAdmins: number) {
  if (user.deleted_at) throw new AdminError(404, "NOT_FOUND", "Akun tidak ditemukan.");
  if (user.id === actorId) throw new AdminError(409, "SELF_ACTION", "Tindakan ini tidak boleh dilakukan pada akun sendiri. Gunakan halaman ganti password untuk password pribadi.");
  if (action === "disable") {
    if (user.account_status === "NONAKTIF") throw new AdminError(409, "INVALID_TRANSITION", "Akun sudah nonaktif.");
    if (user.role === "SUPER_ADMIN" && user.account_status === "AKTIF" && activeSuperAdmins <= 1) throw new AdminError(409, "LAST_SUPER_ADMIN", "Super Admin aktif terakhir tidak dapat dinonaktifkan.");
  } else if (action === "enable") {
    if (user.account_status !== "NONAKTIF") throw new AdminError(409, "INVALID_TRANSITION", "Hanya akun nonaktif yang dapat diaktifkan kembali.");
    if (user.role === "ADMIN") liveAssignment(user);
    if (user.role === "MAHASISWA" && !user.email_verified_at) throw new AdminError(409, "EMAIL_UNVERIFIED", "Aktivasi tidak boleh melewati verifikasi email mahasiswa.");
  } else if (action === "revoke") {
    const a = user.admin_assignments_user;
    if (user.role !== "ADMIN" || !a || a.revoked_at || a.period.status === "ARSIP") throw new AdminError(409, "INVALID_TRANSITION", "Hanya assignment Admin yang belum dicabut pada periode writable yang dapat dicabut.");
  } else {
    assertUserEdit(user);
  }
}
export function studyProgramInput(value: unknown, edit = false) {
  const input = objectInput(value, ["code", "name", ...(edit ? ["version"] : [])]);
  const code = textField(input.code, "code", 1, 10).toUpperCase();
  if (!/^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/.test(code)) throw new AdminError(422, "VALIDATION", "Kode prodi hanya huruf, angka, tanda hubung atau underscore.", { code: "Maksimal 10 karakter, tanpa spasi." });
  return { code, name: textField(input.name, "name", 3, 255) };
}

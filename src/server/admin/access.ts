import "server-only";
import type { Prisma } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { assertVersion, requireSuperAdmin } from "@/lib/admin/policy";
import { assertUserAction, assertUserEdit, createAdminInput, editAdminInput, userActionInput, type UserAction } from "@/lib/admin/access";
import { pagination, uuid } from "@/lib/admin/validation";

const userSelect = { id: true, name: true, email: true, nim: true, angkatan: true, role: true, account_status: true,
  version: true, must_change_password: true, email_verified_at: true, deleted_at: true,
  study_program: { select: { id: true, code: true, name: true } },
  admin_assignments_user: { select: { id: true, department_id: true, period_id: true, revoked_at: true,
    department: { select: { id: true, name: true, deleted_at: true } }, period: { select: { id: true, name: true, status: true } } } },
} as const;
function missing(): never { throw new AdminError(404, "NOT_FOUND", "Akun tidak ditemukan."); }
function stale(): never { throw new AdminError(409, "STALE_STATE", "Akun sudah berubah. Muat ulang sebelum melanjutkan."); }

export async function listUsers(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  const cohort = params.get("cohort") ?? "admins", status = params.get("status") ?? "";
  if (!["admins", "students"].includes(cohort) || !["", "AKTIF", "NONAKTIF", "BELUM_VERIFIKASI"].includes(status)) throw new AdminError(422, "VALIDATION", "Filter pengguna tidak valid.");
  const program = params.get("program_studi_id"); if (program) uuid(program, "program_studi_id");
  return adminRead(async (tx, actor) => {
    requireSuperAdmin(actor);
    const where: Prisma.usersWhereInput = { deleted_at: null,
      role: cohort === "students" ? "MAHASISWA" : { in: ["ADMIN", "SUPER_ADMIN"] },
      ...(status ? { account_status: status as "AKTIF" | "NONAKTIF" | "BELUM_VERIFIKASI" } : {}),
      ...(program ? { program_studi_id: program } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } },
        ...(cohort === "students" ? [{ nim: { contains: q } }, { study_program: { is: { name: { contains: q, mode: "insensitive" as const } } } }] : [])] } : {}),
    };
    const [items, total] = await Promise.all([
      tx.users.findMany({ where, select: userSelect, take, skip, orderBy: [{ name: "asc" }, { id: "asc" }] }), tx.users.count({ where }),
    ]);
    return { items, total, page, page_size: take, actor_id: actor.id };
  });
}
export async function createAdmin(request: Request, value: unknown) {
  const input = createAdminInput(value);
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    // Same lock as operator bootstrap; serializable retries remain in db.ts.
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(20260828, 2)`;
    if (input.role === "ADMIN") {
      const department = await tx.departments.findFirst({ where: { id: input.department_id!, period_id: input.period_id!, deleted_at: null }, select: { period: { select: { status: true } } } });
      if (!department) throw new AdminError(422, "DEPARTMENT_UNAVAILABLE", "Departemen tidak tersedia pada periode yang dipilih.");
      if (department.period.status !== "AKTIF") throw new AdminError(409, "PERIOD_NOT_ACTIVE", "Akun Admin hanya dapat dibuat untuk periode aktif. Pilihan periode mungkin sudah berubah.");
    }
    const user = await tx.users.create({ data: { name: input.name, email: input.email, role: input.role as "ADMIN" | "SUPER_ADMIN",
      password: await hash(input.password, 12), account_status: "AKTIF", must_change_password: true }, select: { id: true } });
    if (input.role === "ADMIN") await tx.admin_assignments.create({ data: { user_id: user.id, department_id: input.department_id!, period_id: input.period_id! } });
    await audit(tx, actor.id, "user.admin.created", "user", user.id, { role: input.role, department_id: input.department_id, period_id: input.period_id, must_change_password: true });
    // No hash, password, verification flag changes or invitation-delivery claim.
    return { id: user.id };
  });
}
export async function editAdmin(request: Request, id: string, value: unknown) {
  uuid(id); const input = editAdminInput(value);
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(20260828, 2)`;
    const target = await tx.users.findFirst({ where: { id, deleted_at: null }, select: userSelect });
    if (!target) return missing();
    assertUserEdit(target); assertVersion(target.version, input.version);
    const changed = await tx.users.updateMany({ where: { id, version: input.version, deleted_at: null }, data: { name: input.name, version: { increment: 1 } } });
    if (changed.count !== 1) stale();
    await audit(tx, actor.id, "user.admin.updated", "user", id, { changed_fields: ["name"] });
    return { id };
  });
}
export async function changeUserAccess(request: Request, id: string, action: UserAction, value: unknown) {
  uuid(id); const input = userActionInput(action, value);
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(20260828, 2)`;
    const target = await tx.users.findFirst({ where: { id, deleted_at: null }, select: userSelect });
    if (!target) return missing();
    const activeSuperAdmins = await tx.users.count({ where: { role: "SUPER_ADMIN", account_status: "AKTIF", deleted_at: null } });
    assertUserAction(target, actor.id, action, activeSuperAdmins); assertVersion(target.version, input.version);
    const data: Prisma.usersUpdateManyMutationInput = { version: { increment: 1 } };
    if (action === "reset-password") {
      const secret = await tx.users.findUnique({ where: { id }, select: { password: true } });
      if (!secret) return missing();
      if (!input.password || await compare(input.password, secret.password)) throw new AdminError(422, "VALIDATION", "Password sementara harus berbeda dari password saat ini.");
      data.password = await hash(input.password, 12); data.must_change_password = true;
    } else data.account_status = action === "enable" ? "AKTIF" : "NONAKTIF";
    const changed = await tx.users.updateMany({ where: { id, version: input.version, deleted_at: null }, data });
    if (changed.count !== 1) stale();
    if (action === "revoke") {
      const revoked = await tx.admin_assignments.updateMany({ where: { id: target.admin_assignments_user!.id, user_id: id, revoked_at: null }, data: { revoked_at: new Date() } });
      if (revoked.count !== 1) stale();
    }
    await tx.admin_sessions.deleteMany({ where: { user_id: id } });
    await audit(tx, actor.id, `user.access.${action}`, "user", id, { reason: input.reason, role: target.role,
      previous_status: target.account_status, ...(action === "revoke" ? { assignment_id: target.admin_assignments_user!.id } : {}),
      ...(action === "reset-password" ? { must_change_password: true } : { status: action === "enable" ? "AKTIF" : "NONAKTIF" }) });
    return { id };
  });
}

import "server-only";
import type { Prisma } from "@prisma/client";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import type { Transaction } from "./db";
import { AdminError } from "@/lib/admin/errors";
import { assertVersion, assertWritablePeriod, departmentScope, type AdminActor } from "@/lib/admin/policy";
import { departmentInput, deleteInput, memberDepartment, memberInput, organizationScope, requireOrganizationAccess, type OrganizationKind } from "@/lib/admin/organization";
import { integer, pagination, uuid } from "@/lib/admin/validation";
import { revalidatePath } from "next/cache";

const periodSelect = { id: true, name: true, status: true } as const;
const departmentSelect = { id: true, name: true, slug: true, description: true, logo_url: true, version: true } as const;
const memberSelect = { id: true, name: true, position: true, photo_url: true, display_order: true, version: true,
  department_id: true, department: { select: { id: true, name: true } } } as const;
function missing(): never { throw new AdminError(404, "NOT_FOUND", "Data tidak ditemukan dalam lingkup akses ini."); }
function stale(): never { throw new AdminError(409, "STALE_STATE", "Data sudah berubah. Muat ulang sebelum melanjutkan."); }
async function periodFor(tx: Transaction, id: string, write = false) {
  const period = await tx.periods.findUnique({ where: { id }, select: periodSelect });
  if (!period) return missing();
  if (write) assertWritablePeriod(period.status);
  return period;
}
async function departmentFor(tx: Transaction, period_id: string, id: string | null) {
  if (id === null) return;
  if (!await tx.departments.findFirst({ where: { id, period_id, deleted_at: null }, select: { id: true } })) missing();
}
function scopedDepartments(actor: AdminActor) {
  const scope = departmentScope(actor);
  return actor.role === "ADMIN" ? { id: scope.department_id, period_id: scope.period_id } : {};
}

// Paginated lookup, not the privileged Period management API. No cross-period
// options are exposed to department admins, even by searching or paging.
export async function organizationPeriods(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  return adminRead(async (tx, actor) => {
    const scope = departmentScope(actor);
    const where: Prisma.periodsWhereInput = { ...(actor.role === "ADMIN" ? { id: scope.period_id } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) };
    const [items, total, default_period] = await Promise.all([
      tx.periods.findMany({ where, select: periodSelect, take, skip, orderBy: [{ year_start: "desc" }, { id: "asc" }] }),
      tx.periods.count({ where }),
      tx.periods.findFirst({ where: actor.role === "ADMIN" ? { id: scope.period_id } : { status: "AKTIF" }, select: periodSelect }),
    ]);
    return { items, total, page, page_size: take, default_period, super_admin: actor.role === "SUPER_ADMIN" };
  });
}

export async function listOrganization(kind: OrganizationKind, params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  return adminRead(async (tx, actor) => {
    requireOrganizationAccess(actor, kind, "read");
    
    // Auto-detect active period if period_id not provided
    let periodIdParam = params.get("period_id");
    if (!periodIdParam) {
      const scope = departmentScope(actor);
      if (scope.period_id) {
        periodIdParam = scope.period_id;
      } else {
        const activePeriod = await tx.periods.findFirst({ where: { status: "AKTIF" }, select: { id: true } });
        periodIdParam = activePeriod?.id ?? null;
      }
    }
    
    const scope = organizationScope(actor, periodIdParam, params.get("department_id"));
    const period = await periodFor(tx, scope.period_id);
    const common = { deleted_at: null, ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}) };
    let items; let total: number;
    if (kind === "departments") {
      const where = { ...common, period_id: scope.period_id, ...(scope.department_id ? { id: scope.department_id } : {}) };
      [items, total] = await Promise.all([
        tx.departments.findMany({ where, select: departmentSelect, take, skip, orderBy: [{ name: "asc" }, { id: "asc" }] }), tx.departments.count({ where }),
      ]);
    } else {
      const where = { ...common, ...scope, ...(q ? { name: undefined, OR: [{ name: { contains: q, mode: "insensitive" as const } }, { position: { contains: q, mode: "insensitive" as const } }] } : {}) };
      const options = { where, select: memberSelect, take, skip, orderBy: [{ display_order: "asc" as const }, { name: "asc" as const }, { id: "asc" as const }] };
      [items, total] = kind === "board-members"
        ? await Promise.all([tx.board_members.findMany(options), tx.board_members.count({ where })])
        : await Promise.all([tx.department_members.findMany(options), tx.department_members.count({ where })]);
    }
    const privileged = actor.role === "SUPER_ADMIN";
    return { items, total, page, page_size: take, period, super_admin: privileged,
      can_create: period.status !== "ARSIP" && (kind !== "departments" || privileged),
      can_delete: period.status !== "ARSIP" && (kind !== "departments" || privileged) };
  });
}

export async function createDepartment(request: Request, value: unknown) {
  return adminMutation(request, async (tx, actor) => {
    const data = departmentInput(value, actor);
    if (!("name" in data) || typeof data.name !== "string" || !("slug" in data) || typeof data.slug !== "string") throw new AdminError(403, "FORBIDDEN", "Hanya Super Admin yang dapat membuat departemen.");
    const input = value as Record<string, unknown>;
    const { period_id } = organizationScope(actor, input.period_id);
    await periodFor(tx, period_id, true);
    const item = await tx.departments.create({ data: { name: data.name, slug: data.slug, description: data.description, logo_url: data.logo_url, period_id }, select: departmentSelect });
    await audit(tx, actor.id, "department.created", "department", item.id, { period_id, name: item.name, slug: item.slug });
    revalidatePath("/");
    revalidatePath("/organisasi");
    revalidatePath("/organisasi/departemen", "layout");
    return item;
  });
}
export async function editDepartment(request: Request, id: string, value: unknown) {
  uuid(id);
  return adminMutation(request, async (tx, actor) => {
    const data = departmentInput(value, actor, true);
    const version = integer((value as Record<string, unknown>).version, "version", 1, 2147483647);
    const item = await tx.departments.findFirst({ where: { id, deleted_at: null, AND: [scopedDepartments(actor)] } });
    if (!item) return missing();
    await periodFor(tx, item.period_id, true); assertVersion(item.version, version);
    const result = await tx.departments.updateMany({ where: { id, version, deleted_at: null, AND: [scopedDepartments(actor)] }, data: { ...data, version: { increment: 1 } } });
    if (result.count !== 1) stale();
    await audit(tx, actor.id, "department.updated", "department", id, { period_id: item.period_id, changed_fields: Object.keys(data) });
    revalidatePath("/");
    revalidatePath("/organisasi");
    revalidatePath("/organisasi/departemen", "layout");
    return { id };
  });
}

async function assertDepartmentEmpty(tx: Transaction, id: string) {
  const related = await tx.departments.findUnique({ where: { id }, select: { _count: { select: {
    admin_assignments_department: { where: { revoked_at: null } },
    board_members_department: { where: { deleted_at: null } }, department_members_department: { where: { deleted_at: null } },
    contents_department: { where: { deleted_at: null } }, work_programs_department: { where: { deleted_at: null } },
    events_department: { where: { deleted_at: null } }, documents_department: { where: { deleted_at: null } },
  } } } });
  if (!related) return missing();
  if (Object.values(related._count).some((count) => count > 0)) throw new AdminError(409, "DEPARTMENT_IN_USE", "Departemen masih memiliki akses Admin yang belum dicabut atau data terkait yang belum dihapus. Selesaikan data terkait terlebih dahulu.");
}
export async function deleteDepartment(request: Request, id: string, value: unknown) {
  uuid(id); const version = deleteInput(value);
  return adminMutation(request, async (tx, actor) => {
    requireOrganizationAccess(actor, "departments", "delete");
    const item = await tx.departments.findFirst({ where: { id, deleted_at: null } });
    if (!item) return missing();
    await periodFor(tx, item.period_id, true); assertVersion(item.version, version);
    await assertDepartmentEmpty(tx, id);
    const result = await tx.departments.updateMany({ where: { id, version, deleted_at: null }, data: { deleted_at: new Date(), version: { increment: 1 } } });
    if (result.count !== 1) stale();
    await audit(tx, actor.id, "department.deleted", "department", id, { period_id: item.period_id, name: item.name, soft_delete: true });
    revalidatePath("/");
    revalidatePath("/organisasi");
    revalidatePath("/organisasi/departemen", "layout");
    return { id };
  });
}

type MemberKind = Exclude<OrganizationKind, "departments">;
export async function createMember(request: Request, kind: MemberKind, value: unknown) {
  return adminMutation(request, async (tx, actor) => {
    requireOrganizationAccess(actor, kind, "create");
    const board = kind === "board-members";
    const data = memberInput(value, board), input = value as Record<string, unknown>;
    const department_id = memberDepartment(input.department_id, board);
    const { period_id } = organizationScope(actor, input.period_id, department_id);
    await periodFor(tx, period_id, true); await departmentFor(tx, period_id, department_id);
    const item = board
      ? await tx.board_members.create({ data: { ...data, period_id, department_id }, select: memberSelect })
      : await tx.department_members.create({ data: { ...data, period_id, department_id: uuid(department_id, "department_id") }, select: memberSelect });
    await audit(tx, actor.id, board ? "board_member.created" : "department_member.created", kind, item.id, { period_id, department_id, name: item.name });
    revalidatePath("/");
    revalidatePath("/organisasi");
    revalidatePath("/organisasi/struktur-kepengurusan");
    revalidatePath("/organisasi/departemen", "layout");
    revalidatePath("/tentang");
    return item;
  });
}
export async function editMember(request: Request, kind: MemberKind, id: string, value: unknown) {
  uuid(id);
  return adminMutation(request, async (tx, actor) => {
    requireOrganizationAccess(actor, kind, "edit");
    const board = kind === "board-members";
    const data = memberInput(value, board, true), input = value as Record<string, unknown>;
    const version = integer(input.version, "version", 1, 2147483647);
    const where = { id, deleted_at: null, ...departmentScope(actor) };
    const item = board ? await tx.board_members.findFirst({ where }) : await tx.department_members.findFirst({ where });
    if (!item) return missing();
    await periodFor(tx, item.period_id, true); assertVersion(item.version, version);
    const department_id = board ? memberDepartment(input.department_id, true) : item.department_id;
    await departmentFor(tx, item.period_id, department_id);
    const update = { where: { ...where, version }, data: { ...data, version: { increment: 1 } } };
    const result = board
      ? await tx.board_members.updateMany({ ...update, data: { ...update.data, department_id } })
      : await tx.department_members.updateMany(update);
    if (result.count !== 1) stale();
    await audit(tx, actor.id, board ? "board_member.updated" : "department_member.updated", kind, id,
      { period_id: item.period_id, department_id, previous_department_id: item.department_id, changed_fields: Object.keys(data) });
    revalidatePath("/");
    revalidatePath("/organisasi");
    revalidatePath("/organisasi/struktur-kepengurusan");
    revalidatePath("/organisasi/departemen", "layout");
    revalidatePath("/tentang");
    return { id };
  });
}
export async function deleteMember(request: Request, kind: MemberKind, id: string, value: unknown) {
  uuid(id); const version = deleteInput(value);
  return adminMutation(request, async (tx, actor) => {
    requireOrganizationAccess(actor, kind, "delete");
    const board = kind === "board-members", where = { id, deleted_at: null, ...departmentScope(actor) };
    const item = board ? await tx.board_members.findFirst({ where }) : await tx.department_members.findFirst({ where });
    if (!item) return missing();
    await periodFor(tx, item.period_id, true); assertVersion(item.version, version);
    const update = { where: { ...where, version }, data: { deleted_at: new Date(), version: { increment: 1 } } };
    const result = board ? await tx.board_members.updateMany(update) : await tx.department_members.updateMany(update);
    if (result.count !== 1) stale();
    await audit(tx, actor.id, board ? "board_member.deleted" : "department_member.deleted", kind, id,
      { period_id: item.period_id, department_id: item.department_id, name: item.name, soft_delete: true });
    revalidatePath("/");
    revalidatePath("/organisasi");
    revalidatePath("/organisasi/struktur-kepengurusan");
    revalidatePath("/organisasi/departemen", "layout");
    revalidatePath("/tentang");
    return { id };
  });
}

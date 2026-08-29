import "server-only";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { assertVersion, requireSuperAdmin } from "@/lib/admin/policy";
import { studyProgramInput } from "@/lib/admin/access";
import { deleteInput } from "@/lib/admin/organization";
import { integer, pagination, uuid } from "@/lib/admin/validation";
const select = { id: true, code: true, name: true, version: true, _count: { select: { users_study_program: true } } } as const;
export async function listStudyPrograms(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  return adminRead(async (tx, actor) => {
    requireSuperAdmin(actor);
    const where = { deleted_at: null, ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { code: { contains: q, mode: "insensitive" as const } }] } : {}) };
    const [items, total] = await Promise.all([
      tx.study_programs.findMany({ where, select, take, skip, orderBy: [{ name: "asc" }, { id: "asc" }] }), tx.study_programs.count({ where }),
    ]);
    return { items, total, page, page_size: take };
  });
}
export async function createStudyProgram(request: Request, value: unknown) {
  const data = studyProgramInput(value);
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    const item = await tx.study_programs.create({ data, select: { id: true } });
    await audit(tx, actor.id, "study_program.created", "study_program", item.id, data);
    return item;
  });
}
export async function editStudyProgram(request: Request, id: string, value: unknown) {
  uuid(id); const data = studyProgramInput(value, true), version = integer((value as Record<string, unknown>).version, "version", 1, 2147483647);
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    const item = await tx.study_programs.findFirst({ where: { id, deleted_at: null }, select });
    if (!item) throw new AdminError(404, "NOT_FOUND", "Program studi tidak ditemukan.");
    assertVersion(item.version, version);
    const changed = await tx.study_programs.updateMany({ where: { id, version, deleted_at: null }, data: { ...data, version: { increment: 1 } } });
    if (changed.count !== 1) throw new AdminError(409, "STALE_STATE", "Program studi sudah berubah.");
    await audit(tx, actor.id, "study_program.updated", "study_program", id, { before: { code: item.code, name: item.name }, after: data });
    return { id };
  });
}
export async function deleteStudyProgram(request: Request, id: string, value: unknown) {
  uuid(id); const version = deleteInput(value);
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    const item = await tx.study_programs.findFirst({ where: { id, deleted_at: null }, select });
    if (!item) throw new AdminError(404, "NOT_FOUND", "Program studi tidak ditemukan.");
    assertVersion(item.version, version);
    if (item._count.users_study_program > 0) throw new AdminError(409, "STUDY_PROGRAM_IN_USE", "Program studi masih dirujuk akun pengguna, termasuk akun nonaktif/terhapus. Referensi tidak boleh dihilangkan.");
    const changed = await tx.study_programs.updateMany({ where: { id, version, deleted_at: null }, data: { deleted_at: new Date(), version: { increment: 1 } } });
    if (changed.count !== 1) throw new AdminError(409, "STALE_STATE", "Program studi sudah berubah.");
    await audit(tx, actor.id, "study_program.deleted", "study_program", id, { code: item.code, name: item.name, soft_delete: true });
    return { id };
  });
}

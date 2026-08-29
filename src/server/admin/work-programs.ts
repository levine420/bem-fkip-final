import "server-only";
import type { Prisma } from "@prisma/client";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { departmentScope } from "@/lib/admin/policy";
import { pagination, uuid, textField, integer } from "@/lib/admin/validation";
import { generateSlug } from "@/lib/admin/slug";

const workProgramSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  target_time: true,
  success_indicator: true,
  progress_notes: true,
  status: true,
  display_order: true,
  department_id: true,
  period_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  department: { select: { id: true, name: true, slug: true } },
  period: { select: { id: true, name: true } },
} as const;

export async function listWorkPrograms(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  const status = params.get("status");
  const department_id = params.get("department_id");

  return adminRead(async (tx, actor) => {
    const scope = departmentScope(actor);

    const where: Prisma.work_programsWhereInput = {
      deleted_at: null,
      ...(actor.role === "ADMIN" ? { department_id: scope.department_id, period_id: scope.period_id } : {}),
      ...(status ? { status: status as any } : {}),
      ...(department_id && actor.role === "SUPER_ADMIN" ? { department_id: uuid(department_id) } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      tx.work_programs.findMany({
        where,
        select: workProgramSelect,
        take,
        skip,
        orderBy: [{ display_order: "asc" }, { created_at: "desc" }, { id: "asc" }],
      }),
      tx.work_programs.count({ where }),
    ]);

    return { items, total, page, page_size: take };
  });
}

export async function createWorkProgram(request: Request, input: {
  name: string;
  description: string;
  target_time?: string;
  success_indicator?: string;
  progress_notes?: string;
  status?: string;
  display_order?: number;
  department_id?: string;
}) {
  return adminMutation(request, async (tx, actor) => {
    const scope = departmentScope(actor);
    const name = textField(input.name, "name", 1, 150);
    const description = textField(input.description, "description", 1, 500);
    const target_time = input.target_time ? textField(input.target_time, "target_time", 0, 150) : null;
    const success_indicator = input.success_indicator ? textField(input.success_indicator, "success_indicator", 0, 300) : null;
    const progress_notes = input.progress_notes ? textField(input.progress_notes, "progress_notes", 0, 2000) : null;
    const status = (input.status || "BELUM_MULAI") as any;
    const display_order = input.display_order !== undefined ? integer(input.display_order, "display_order", 0, 1000) : 0;

    const activePeriod = await tx.periods.findFirst({ where: { status: "AKTIF" }, select: { id: true } });
    const period_id = actor.role === "ADMIN" && scope.period_id ? scope.period_id : (activePeriod?.id ?? "");

    if (!period_id) {
      throw new AdminError(400, "NO_ACTIVE_PERIOD", "Tidak ada periode aktif.");
    }

    const deptId = actor.role === "ADMIN" ? scope.department_id : (input.department_id ? uuid(input.department_id) : null);
    const slug = generateSlug(name) + "-" + Date.now().toString(36);

    const program = await tx.work_programs.create({
      data: {
        name,
        slug,
        description,
        target_time,
        success_indicator,
        progress_notes,
        status,
        display_order,
        department_id: deptId,
        period_id,
      },
      select: workProgramSelect,
    });

    await audit(tx, actor.id, "WORK_PROGRAM_CREATE", "work_programs", program.id, { name: program.name });
    return program;
  });
}

export async function updateWorkProgram(request: Request, id: string, input: {
  name?: string;
  description?: string;
  target_time?: string;
  success_indicator?: string;
  progress_notes?: string;
  status?: string;
  display_order?: number;
}) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.work_programs.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, department_id: true, name: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Program kerja tidak ditemukan.");
    }

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (existing.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Tidak dapat mengubah program kerja departemen lain.");
      }
    }

    const updates: Prisma.work_programsUpdateInput = {};
    if (input.name !== undefined) updates.name = textField(input.name, "name", 1, 150);
    if (input.description !== undefined) updates.description = textField(input.description, "description", 1, 500);
    if (input.target_time !== undefined) updates.target_time = input.target_time ? textField(input.target_time, "target_time", 0, 150) : null;
    if (input.success_indicator !== undefined) updates.success_indicator = input.success_indicator ? textField(input.success_indicator, "success_indicator", 0, 300) : null;
    if (input.progress_notes !== undefined) updates.progress_notes = input.progress_notes ? textField(input.progress_notes, "progress_notes", 0, 2000) : null;
    if (input.status !== undefined) updates.status = input.status as any;
    if (input.display_order !== undefined) updates.display_order = integer(input.display_order, "display_order", 0, 1000);

    const program = await tx.work_programs.update({
      where: { id: uuid(id) },
      data: updates,
      select: workProgramSelect,
    });

    await audit(tx, actor.id, "WORK_PROGRAM_UPDATE", "work_programs", program.id, { name: program.name });
    return program;
  });
}

export async function deleteWorkProgram(request: Request, id: string) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.work_programs.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, department_id: true, name: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Program kerja tidak ditemukan.");
    }

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (existing.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Tidak dapat menghapus program kerja departemen lain.");
      }
    }

    await tx.work_programs.update({
      where: { id: uuid(id) },
      data: { deleted_at: new Date() },
    });

    await audit(tx, actor.id, "WORK_PROGRAM_DELETE", "work_programs", id, { name: existing.name });
    return { success: true };
  });
}

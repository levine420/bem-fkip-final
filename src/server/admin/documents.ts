import "server-only";
import type { Prisma } from "@prisma/client";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { departmentScope } from "@/lib/admin/policy";
import { pagination, uuid, textField, integer } from "@/lib/admin/validation";
import { revalidatePath } from "next/cache";

const documentSelect = {
  id: true,
  name: true,
  original_filename: true,
  storage_key: true,
  file_type: true,
  file_size: true,
  download_count: true,
  is_public: true,
  category: true,
  uploader_id: true,
  department_id: true,
  period_id: true,
  uploaded_at: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  department: { select: { id: true, name: true, slug: true } },
  uploader: { select: { id: true, name: true } },
  period: { select: { id: true, name: true } },
} as const;

export async function listDocuments(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  const category = params.get("category");
  const is_public = params.get("is_public");
  const department_id = params.get("department_id");

  return adminRead(async (tx, actor) => {
    const scope = departmentScope(actor);

    const where: Prisma.documentsWhereInput = {
      deleted_at: null,
      ...(actor.role === "ADMIN" ? { department_id: scope.department_id, period_id: scope.period_id } : {}),
      ...(category ? { category: category as any } : {}),
      ...(is_public === "true" ? { is_public: true } : is_public === "false" ? { is_public: false } : {}),
      ...(department_id && actor.role === "SUPER_ADMIN" ? { department_id: uuid(department_id) } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { original_filename: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    };

    const [rawItems, total] = await Promise.all([
      tx.documents.findMany({
        where,
        select: documentSelect,
        take,
        skip,
        orderBy: [{ created_at: "desc" }, { id: "asc" }],
      }),
      tx.documents.count({ where }),
    ]);

    // Convert BigInt file_size to Number for JSON serialization safety
    const items = rawItems.map(item => ({
      ...item,
      file_size: Number(item.file_size),
    }));

    return { items, total, page, page_size: take };
  });
}

export async function createDocument(request: Request, input: {
  name: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  category?: string;
  is_public?: boolean;
  department_id?: string;
}) {
  return adminMutation(request, async (tx, actor) => {
    const scope = departmentScope(actor);
    const name = textField(input.name, "name", 1, 255);
    const original_filename = textField(input.original_filename, "original_filename", 1, 255);
    const file_type = textField(input.file_type, "file_type", 1, 100);
    const file_size = BigInt(integer(input.file_size, "file_size", 1, 100000000));
    const category = (input.category || "ARSIP") as any;
    const is_public = !!input.is_public;

    const activePeriod = await tx.periods.findFirst({ where: { status: "AKTIF" }, select: { id: true } });
    const period_id = actor.role === "ADMIN" && scope.period_id ? scope.period_id : (activePeriod?.id ?? "");

    if (!period_id) {
      throw new AdminError(400, "NO_ACTIVE_PERIOD", "Tidak ada periode aktif.");
    }

    const deptId = actor.role === "ADMIN" ? scope.department_id : (input.department_id ? uuid(input.department_id) : null);
    const storage_key = "docs/" + Date.now().toString(36) + "_" + original_filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    const doc = await tx.documents.create({
      data: {
        name,
        original_filename,
        storage_key,
        file_type,
        file_size,
        category,
        is_public,
        uploader_id: actor.id,
        department_id: deptId,
        period_id,
      },
      select: documentSelect,
    });

    await audit(tx, actor.id, "DOCUMENT_CREATE", "documents", doc.id, { name: doc.name });
    
    revalidatePath("/");
    revalidatePath("/dokumen");

    return { ...doc, file_size: Number(doc.file_size) };
  });
}

export async function updateDocument(request: Request, id: string, input: {
  name?: string;
  category?: string;
  is_public?: boolean;
}) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.documents.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, department_id: true, name: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Dokumen tidak ditemukan.");
    }

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (existing.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Tidak dapat mengubah dokumen departemen lain.");
      }
    }

    const updates: Prisma.documentsUpdateInput = {};
    if (input.name !== undefined) updates.name = textField(input.name, "name", 1, 255);
    if (input.category !== undefined) updates.category = input.category as any;
    if (input.is_public !== undefined) updates.is_public = !!input.is_public;

    const doc = await tx.documents.update({
      where: { id: uuid(id) },
      data: updates,
      select: documentSelect,
    });

    await audit(tx, actor.id, "DOCUMENT_UPDATE", "documents", doc.id, { name: doc.name, is_public: doc.is_public });

    revalidatePath("/");
    revalidatePath("/dokumen");

    return { ...doc, file_size: Number(doc.file_size) };
  });
}

export async function deleteDocument(request: Request, id: string) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.documents.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, department_id: true, name: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Dokumen tidak ditemukan.");
    }

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (existing.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Tidak dapat menghapus dokumen departemen lain.");
      }
    }

    await tx.documents.update({
      where: { id: uuid(id) },
      data: { deleted_at: new Date() },
    });

    await audit(tx, actor.id, "DOCUMENT_DELETE", "documents", id, { name: existing.name });

    revalidatePath("/");
    revalidatePath("/dokumen");

    return { success: true };
  });
}

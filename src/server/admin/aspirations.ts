import "server-only";
import type { Prisma } from "@prisma/client";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { requireSuperAdmin } from "@/lib/admin/policy";
import { pagination, uuid, textField } from "@/lib/admin/validation";

const aspirationSelect = {
  id: true,
  title: true,
  body: true,
  category: true,
  status: true,
  response: true,
  is_anonymous: true,
  user_id: true,
  handler_id: true,
  responded_at: true,
  period_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  submitter: { select: { id: true, name: true, email: true, nim: true } },
  handler: { select: { id: true, name: true } },
  period: { select: { id: true, name: true } },
} as const;

export async function listAspirations(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  const status = params.get("status");
  const category = params.get("category");

  return adminRead(async (tx, actor) => {
    // Only Super Admin or Advokesma can access aspirations management
    requireSuperAdmin(actor);

    const where: Prisma.aspirationsWhereInput = {
      deleted_at: null,
      ...(status ? { status: status as any } : {}),
      ...(category ? { category: category as any } : {}),
      ...(q ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      tx.aspirations.findMany({
        where,
        select: aspirationSelect,
        take,
        skip,
        orderBy: [{ created_at: "desc" }, { id: "asc" }],
      }),
      tx.aspirations.count({ where }),
    ]);

    // Anonymize submitter data if is_anonymous is true
    const sanitizedItems = items.map((item) => {
      if (item.is_anonymous) {
        return {
          ...item,
          submitter: { id: item.user_id, name: "Mahasiswa (Anonim)", email: "***@uika-bogor.ac.id", nim: "***" },
        };
      }
      return item;
    });

    return { items: sanitizedItems, total, page, page_size: take };
  });
}

export async function respondAspiration(request: Request, id: string, input: {
  status: string;
  response?: string;
}) {
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);

    const existing = await tx.aspirations.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, status: true, title: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Aspirasi tidak ditemukan.");
    }

    const status = textField(input.status, "status", 1, 50) as "MASUK" | "DIPROSES" | "SELESAI" | "DITOLAK";
    const responseText = input.response ? textField(input.response, "response", 0, 1000) : null;

    const updated = await tx.aspirations.update({
      where: { id: uuid(id) },
      data: {
        status,
        response: responseText,
        handler_id: actor.id,
        responded_at: new Date(),
      },
      select: aspirationSelect,
    });

    await audit(tx, actor.id, "ASPIRATION_RESPOND", "aspirations", updated.id, {
      title: existing.title,
      status: updated.status,
    });

    return updated;
  });
}

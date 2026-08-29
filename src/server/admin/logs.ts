import "server-only";
import type { Prisma } from "@prisma/client";
import { adminRead } from "./auth";
import { requireSuperAdmin } from "@/lib/admin/policy";
import { AdminError } from "@/lib/admin/errors";
import { pagination, uuid } from "@/lib/admin/validation";
export async function listLogs(params: URLSearchParams) {
  const { page, q, take, skip } = pagination(params);
  const actorId = params.get("user_id"); if (actorId) uuid(actorId, "user_id");
  const from = params.get("from"), to = params.get("to");
  for (const date of [from, to]) if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)))) throw new AdminError(422, "VALIDATION", "Tanggal tidak valid.");
  if (from && to && from > to) throw new AdminError(422, "VALIDATION", "Rentang tanggal tidak valid.");
  const where: Prisma.activity_logsWhereInput = {
    ...(q ? { action: { contains: q, mode: "insensitive" } } : {}),
    ...(actorId ? { user_id: actorId } : {}),
    ...(from || to ? { created_at: { ...(from ? { gte: new Date(`${from}T00:00:00Z`) } : {}),
      ...(to ? { lt: new Date(Date.parse(`${to}T00:00:00Z`) + 86400000) } : {}) } } : {}),
  };
  return adminRead(async (tx, actor) => {
    requireSuperAdmin(actor);
    const [items, total] = await Promise.all([
      tx.activity_logs.findMany({ where, skip, take, orderBy: [{ created_at: "desc" }, { id: "desc" }],
        select: { id: true, created_at: true, action: true, target_type: true, target_id: true,
          actor: { select: { name: true, role: true } } } }),
      tx.activity_logs.count({ where }),
    ]);
    // Do not serialize arbitrary details blobs into the UI. Future aspiration
    // records must never reveal submitter identity via audit or relation joins.
    return { items, total, page, page_size: take };
  });
}

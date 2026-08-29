import "server-only";
import type { Prisma } from "@prisma/client";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { assertActivation, assertVersion, assertWritablePeriod, requireSuperAdmin } from "@/lib/admin/policy";
import { integer, objectInput, pagination, periodInput, uuid } from "@/lib/admin/validation";

export async function listPeriods(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  const status = params.get("status") ?? "";
  if (!["", "NONAKTIF", "AKTIF", "ARSIP"].includes(status)) throw new AdminError(422, "VALIDATION", "Status periode tidak valid.");
  const sort = params.get("sort") ?? "newest";
  if (!["newest", "oldest", "name"].includes(sort)) throw new AdminError(422, "VALIDATION", "Urutan tidak valid.");
  const where: Prisma.periodsWhereInput = { ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status: status as "NONAKTIF" | "AKTIF" | "ARSIP" } : {}) };
  return adminRead(async (tx, actor) => {
    requireSuperAdmin(actor);
    const [items, total, active] = await Promise.all([
      tx.periods.findMany({ where, take, skip, orderBy: sort === "name" ? [{ name: "asc" }, { id: "asc" }] : [{ year_start: sort === "oldest" ? "asc" : "desc" }, { id: "asc" }] }),
      tx.periods.count({ where }),
      tx.periods.findFirst({ where: { status: "AKTIF" }, select: { id: true, name: true } }),
    ]);
    return { items, total, page, page_size: take, active };
  });
}
export async function createPeriod(request: Request, value: unknown) {
  const data = periodInput(value);
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    const item = await tx.periods.create({ data });
    await audit(tx, actor.id, "period.created", "period", item.id, { name: item.name, status: item.status });
    return item;
  });
}
export async function editPeriod(request: Request, id: string, value: unknown) {
  uuid(id);
  const data = periodInput(value, true);
  const input = value as Record<string, unknown>;
  const version = integer(input.version, "version", 1, 2147483647);
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    const item = await tx.periods.findUnique({ where: { id } });
    if (!item) throw new AdminError(404, "NOT_FOUND", "Periode tidak ditemukan.");
    assertWritablePeriod(item.status); assertVersion(item.version, version);
    const result = await tx.periods.updateMany({ where: { id, version, status: { not: "ARSIP" } }, data: { ...data, version: { increment: 1 } } });
    if (result.count !== 1) throw new AdminError(409, "STALE_STATE", "Data sudah berubah. Muat ulang.");
    await audit(tx, actor.id, "period.updated", "period", id, {
      before: { name: item.name, visi: item.visi, misi: item.misi, year_start: item.year_start, year_end: item.year_end, photo_url: item.photo_url },
      after: data,
    });
    return { id };
  });
}
export async function activatePeriod(request: Request, id: string, value: unknown) {
  uuid(id);
  const input = objectInput(value, ["version", "expected_active_id", "confirmed"]);
  if (input.confirmed !== true) throw new AdminError(422, "CONFIRMATION_REQUIRED", "Konfirmasi aktivasi periode wajib diberikan.");
  const version = integer(input.version, "version", 1, 2147483647);
  const expectedActive = input.expected_active_id === null ? null : uuid(input.expected_active_id, "expected_active_id");
  return adminMutation(request, async (tx, actor) => {
    requireSuperAdmin(actor);
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(20260828, 1)`;
    const item = await tx.periods.findUnique({ where: { id } });
    if (!item) throw new AdminError(404, "NOT_FOUND", "Periode tidak ditemukan.");
    const active = await tx.periods.findFirst({ where: { status: "AKTIF" } });
    assertActivation(item.status, active?.id ?? null, expectedActive); assertVersion(item.version, version);
    if (active) {
      // BEFORE trigger revokes assignments, disables department users and drops
      // their sessions while old period is writable. All roll back with audit.
      await tx.periods.update({ where: { id: active.id }, data: { status: "ARSIP", version: { increment: 1 } } });
    }
    const updated = await tx.periods.update({ where: { id }, data: { status: "AKTIF", version: { increment: 1 } } });
    await audit(tx, actor.id, "period.activated", "period", id,
      { new_period: item.name, archived_period_id: active?.id ?? null, archived_period: active?.name ?? null });
    return updated;
  });
}

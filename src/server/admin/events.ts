import "server-only";
import type { Prisma } from "@prisma/client";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { departmentScope } from "@/lib/admin/policy";
import { pagination, uuid, textField, integer } from "@/lib/admin/validation";
import { generateSlug } from "@/lib/admin/slug";
import { revalidatePath } from "next/cache";

const eventSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  location: true,
  poster_url: true,
  start_time: true,
  end_time: true,
  registration_deadline: true,
  max_participants: true,
  registration_schema: true,
  status: true,
  registration_status: true,
  created_by_user_id: true,
  department_id: true,
  period_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  department: { select: { id: true, name: true, slug: true } },
  creator: { select: { id: true, name: true } },
  _count: { select: { event_registrations_event: true } },
} as const;

export async function listEvents(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  const status = params.get("status");
  const registration_status = params.get("registration_status");
  const department_id = params.get("department_id");

  return adminRead(async (tx, actor) => {
    const scope = departmentScope(actor);

    const where: Prisma.eventsWhereInput = {
      deleted_at: null,
      ...(actor.role === "ADMIN" ? { department_id: scope.department_id, period_id: scope.period_id } : {}),
      ...(status ? { status: status as any } : {}),
      ...(registration_status ? { registration_status: registration_status as any } : {}),
      ...(department_id && actor.role === "SUPER_ADMIN" ? { department_id: uuid(department_id) } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      tx.events.findMany({
        where,
        select: eventSelect,
        take,
        skip,
        orderBy: [{ start_time: "desc" }, { created_at: "desc" }],
      }),
      tx.events.count({ where }),
    ]);

    return { items, total, page, page_size: take };
  });
}

export async function createEvent(request: Request, input: {
  name: string;
  description: string;
  location: string;
  start_time: string;
  end_time?: string;
  registration_deadline?: string;
  max_participants?: number;
  poster_url?: string;
  status?: string;
  registration_status?: string;
  department_id?: string;
}) {
  return adminMutation(request, async (tx, actor) => {
    const scope = departmentScope(actor);
    const name = textField(input.name, "name", 1, 200);
    const description = textField(input.description, "description", 1, 10000);
    const location = textField(input.location, "location", 1, 200);
    const start_time = new Date(input.start_time);
    const end_time = input.end_time ? new Date(input.end_time) : null;
    const registration_deadline = input.registration_deadline ? new Date(input.registration_deadline) : null;
    const max_participants = input.max_participants !== undefined ? integer(input.max_participants, "max_participants", 1, 10000) : null;
    const poster_url = input.poster_url ? textField(input.poster_url, "poster_url", 0, 2000000) : null;
    const status = (input.status || "DRAF") as any;
    const registration_status = (input.registration_status || "TUTUP") as any;

    const activePeriod = await tx.periods.findFirst({ where: { status: "AKTIF" }, select: { id: true } });
    const period_id = actor.role === "ADMIN" && scope.period_id ? scope.period_id : (activePeriod?.id ?? "");

    if (!period_id) {
      throw new AdminError(400, "NO_ACTIVE_PERIOD", "Tidak ada periode aktif.");
    }

    // Normalize department_id: null/empty → undefined
    const departmentId = actor.role === "ADMIN" 
      ? scope.department_id 
      : (input.department_id?.trim() ? uuid(input.department_id.trim()) : null);
    
    const normalizedDepartmentId = typeof departmentId === "string" && departmentId.trim() 
      ? departmentId.trim() 
      : undefined;

    const slug = generateSlug(name) + "-" + Date.now().toString(36);

    const event = await tx.events.create({
      data: {
        name,
        slug,
        description,
        location,
        start_time,
        end_time,
        registration_deadline,
        max_participants,
        poster_url,
        status,
        registration_status,
        created_by_user_id: actor.id,
        department_id: normalizedDepartmentId,
        period_id,
      },
      select: eventSelect,
    });

    await audit(tx, actor.id, "EVENT_CREATE", "events", event.id, { name: event.name });
    
    revalidatePath("/");
    revalidatePath("/kegiatan/kalender");
    revalidatePath("/kegiatan");

    return event;
  });
}

export async function updateEvent(request: Request, id: string, input: {
  name?: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  registration_deadline?: string;
  max_participants?: number;
  poster_url?: string;
  status?: string;
  registration_status?: string;
}) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.events.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, department_id: true, name: true, slug: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Kegiatan tidak ditemukan.");
    }

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (existing.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Tidak dapat mengubah kegiatan departemen lain.");
      }
    }

    const updates: Prisma.eventsUpdateInput = {};
    if (input.name !== undefined) updates.name = textField(input.name, "name", 1, 200);
    if (input.description !== undefined) updates.description = textField(input.description, "description", 1, 10000);
    if (input.location !== undefined) updates.location = textField(input.location, "location", 1, 200);
    if (input.start_time !== undefined) updates.start_time = new Date(input.start_time);
    if (input.end_time !== undefined) updates.end_time = input.end_time ? new Date(input.end_time) : null;
    if (input.registration_deadline !== undefined) updates.registration_deadline = input.registration_deadline ? new Date(input.registration_deadline) : null;
    if (input.max_participants !== undefined) updates.max_participants = input.max_participants ? integer(input.max_participants, "max_participants", 1, 10000) : null;
    if (input.poster_url !== undefined) updates.poster_url = input.poster_url ? textField(input.poster_url, "poster_url", 0, 2000000) : null;
    if (input.status !== undefined) updates.status = input.status as any;
    if (input.registration_status !== undefined) updates.registration_status = input.registration_status as any;

    const event = await tx.events.update({
      where: { id: uuid(id) },
      data: updates,
      select: eventSelect,
    });

    await audit(tx, actor.id, "EVENT_UPDATE", "events", event.id, { name: event.name });

    revalidatePath("/");
    revalidatePath("/kegiatan/kalender");
    revalidatePath("/kegiatan");

    return event;
  });
}

export async function deleteEvent(request: Request, id: string) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.events.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, department_id: true, name: true, slug: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Kegiatan tidak ditemukan.");
    }

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (existing.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Tidak dapat menghapus kegiatan departemen lain.");
      }
    }

    await tx.events.update({
      where: { id: uuid(id) },
      data: { deleted_at: new Date() },
    });

    await audit(tx, actor.id, "EVENT_DELETE", "events", id, { name: existing.name });

    revalidatePath("/");
    revalidatePath("/kegiatan/kalender");
    revalidatePath("/kegiatan");

    return { success: true };
  });
}

export async function listEventRegistrations(eventId: string, params: URLSearchParams) {
  const { take, skip, page } = pagination(params);
  const status = params.get("status");

  return adminRead(async (tx, actor) => {
    const event = await tx.events.findFirst({
      where: { id: uuid(eventId), deleted_at: null },
      select: { id: true, department_id: true, name: true },
    });

    if (!event) throw new AdminError(404, "NOT_FOUND", "Kegiatan tidak ditemukan.");

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (event.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Akses terbatas.");
      }
    }

    const where: Prisma.event_registrationsWhereInput = {
      event_id: uuid(eventId),
      ...(status ? { status: status as any } : {}),
    };

    const [items, total] = await Promise.all([
      tx.event_registrations.findMany({
        where,
        take,
        skip,
        orderBy: { created_at: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, nim: true, angkatan: true, study_program: { select: { name: true } } } },
        },
      }),
      tx.event_registrations.count({ where }),
    ]);

    return { items, total, page, page_size: take, event };
  });
}

export async function updateRegistrationStatus(request: Request, eventId: string, registrationId: string, input: {
  status: string;
  decision_note?: string;
}) {
  return adminMutation(request, async (tx, actor) => {
    const reg = await tx.event_registrations.findFirst({
      where: { id: uuid(registrationId), event_id: uuid(eventId) },
      include: { event: { select: { department_id: true, name: true } } },
    });

    if (!reg) throw new AdminError(404, "NOT_FOUND", "Pendaftaran tidak ditemukan.");

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (reg.event.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Akses terbatas.");
      }
    }

    const status = textField(input.status, "status", 1, 50) as any;
    const note = input.decision_note ? textField(input.decision_note, "decision_note", 0, 500) : null;

    const updated = await tx.event_registrations.update({
      where: { id: uuid(registrationId) },
      data: { status, decision_note: note },
    });

    await audit(tx, actor.id, "EVENT_REGISTRATION_UPDATE", "event_registrations", registrationId, {
      event_id: eventId,
      status: updated.status,
    });

    return updated;
  });
}

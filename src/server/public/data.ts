import "server-only";
import { db } from "./db";

export async function getActivePeriod() {
  try {
    const period = await db.periods.findFirst({
      where: { status: "AKTIF" },
      select: {
        id: true,
        name: true,
        visi: true,
        misi: true,
        photo_url: true,
        year_start: true,
        year_end: true,
      },
    });

    return period ?? null;
  } catch (err) {
    console.error("DB getActivePeriod error:", err);
    return null;
  }
}

export async function getPublishedContents(params: {
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const { category, limit = 20, offset = 0, search } = params;

  try {
    const where = {
      status: "TERBIT" as const,
      deleted_at: null,
      ...(category ? { category: category as any } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { excerpt: { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      db.contents.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail_url: true,
          category: true,
          tags: true,
          reading_time: true,
          published_at: true,
          author: { select: { name: true } },
          department: { select: { name: true } },
        },
        orderBy: { published_at: "desc" },
        take: limit,
        skip: offset,
      }),
      db.contents.count({ where }),
    ]);

    return { items, total };
  } catch (err) {
    console.error("DB getPublishedContents error:", err);
    return { items: [], total: 0 };
  }
}

export async function getPublishedContentBySlug(slug: string) {
  try {
    const content = await db.contents.findFirst({
      where: {
        slug,
        status: "TERBIT",
        deleted_at: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        seo_slug: true,
        meta_title: true,
        meta_description: true,
        excerpt: true,
        body: true,
        thumbnail_url: true,
        category: true,
        tags: true,
        reading_time: true,
        view_count: true,
        published_at: true,
        author: { select: { name: true } },
        department: { select: { name: true } },
      },
    });

    if (content) {
      db.contents.update({
        where: { id: content.id },
        data: { view_count: { increment: 1 } },
      }).catch(() => {});
    }

    return content ?? null;
  } catch (err) {
    console.error("DB getPublishedContentBySlug error:", err);
    return null;
  }
}

export async function getActiveBoardMembers() {
  try {
    const period = await getActivePeriod();
    if (!period) return [];

    const members = await db.board_members.findMany({
      where: {
        period_id: period.id,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        position: true,
        photo_url: true,
        display_order: true,
        department_id: true,
        department: { select: { name: true } },
      },
      orderBy: { display_order: "asc" },
    });

    return members;
  } catch (err) {
    console.error("DB getActiveBoardMembers error:", err);
    return [];
  }
}

export async function getActiveDepartments() {
  try {
    const period = await getActivePeriod();
    if (!period) return [];

    const departments = await db.departments.findMany({
      where: {
        period_id: period.id,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo_url: true,
      },
      orderBy: { name: "asc" },
    });

    return departments;
  } catch (err) {
    console.error("DB getActiveDepartments error:", err);
    return [];
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getDepartmentBySlug(slug: string) {
  try {
    const period = await getActivePeriod();
    if (!period) return null;

    const isUuid = UUID_REGEX.test(slug);

    const department = await db.departments.findFirst({
      where: {
        ...(isUuid ? { OR: [{ slug }, { id: slug }] } : { slug }),
        period_id: period.id,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo_url: true,
        department_members_department: {
          where: { deleted_at: null },
          select: {
            id: true,
            name: true,
            position: true,
            photo_url: true,
            display_order: true,
          },
          orderBy: [{ display_order: "asc" }, { id: "asc" }],
        },
        work_programs_department: {
          where: { deleted_at: null, period_id: period.id },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            target_time: true,
            success_indicator: true,
            status: true,
            display_order: true,
          },
          orderBy: [{ display_order: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!department) return null;

    return {
      ...department,
      period: {
        id: period.id,
        name: period.name,
        year_start: period.year_start,
        year_end: period.year_end,
      },
    };
  } catch (err) {
    console.error("DB getDepartmentBySlug error:", err);
    return null;
  }
}

export async function getPublicStats() {
  try {
    const period = await getActivePeriod();
    if (!period) return { departments: 0, programs: 0, contents: 0, events: 0 };

    const [departments, programs, contents, events] = await Promise.all([
      db.departments.count({ where: { period_id: period.id, deleted_at: null } }),
      db.work_programs.count({ where: { period_id: period.id, deleted_at: null } }),
      db.contents.count({ where: { status: "TERBIT", deleted_at: null } }),
      db.events.count({ where: { period_id: period.id, deleted_at: null, status: { in: ["TERBIT", "BERJALAN", "SELESAI"] } } }),
    ]);

    return { departments, programs, contents, events };
  } catch (err) {
    console.error("DB getPublicStats error:", err);
    return { departments: 0, programs: 0, contents: 0, events: 0 };
  }
}

export async function getPublicWorkPrograms() {
  try {
    const period = await getActivePeriod();
    if (!period) return [];

    const items = await db.work_programs.findMany({
      where: {
        period_id: period.id,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        target_time: true,
        success_indicator: true,
        status: true,
        display_order: true,
        department_id: true,
        department: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ display_order: "asc" }, { id: "asc" }],
    });

    return items.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status as any,
      display_order: p.display_order,
      department_id: p.department?.slug || p.department_id || "",
      period_id: period.id,
      target_waktu: p.target_time || "Periode Aktif",
      sasaran: p.success_indicator || "Mahasiswa FKIP UIKA",
    }));
  } catch (err) {
    console.error("DB getPublicWorkPrograms error:", err);
    return [];
  }
}

export async function getPublicEvents(params?: { limit?: number }) {
  try {
    const items = await db.events.findMany({
      where: {
        status: { in: ["TERBIT", "BERJALAN", "SELESAI"] },
        deleted_at: null,
      },
      select: {
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
        registration_status: true,
        status: true,
        department: { select: { name: true } },
      },
      orderBy: { start_time: "asc" },
      ...(params?.limit ? { take: params.limit } : {}),
    });

    return items;
  } catch (err) {
    console.error("DB getPublicEvents error:", err);
    return [];
  }
}

export async function getPublicEventByIdOrSlug(idOrSlug: string) {
  try {
    const isUuid = UUID_REGEX.test(idOrSlug);
    const event = await db.events.findFirst({
      where: {
        OR: isUuid ? [{ id: idOrSlug }, { slug: idOrSlug }] : [{ slug: idOrSlug }],
        status: { in: ["TERBIT", "BERJALAN", "SELESAI"] },
        deleted_at: null,
      },
      select: {
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
        registration_status: true,
        status: true,
        department: { select: { name: true } },
      },
    });

    return event ?? null;
  } catch (err) {
    console.error("DB getPublicEventByIdOrSlug error:", err);
    return null;
  }
}

export async function getPublicDocuments(params?: { category?: string }) {
  try {
    const items = await db.documents.findMany({
      where: {
        is_public: true,
        deleted_at: null,
        ...(params?.category ? { category: params.category as any } : {}),
      },
      select: {
        id: true,
        name: true,
        original_filename: true,
        file_type: true,
        file_size: true,
        download_count: true,
        category: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    return items.map((doc) => ({
      ...doc,
      file_size: Number(doc.file_size),
    }));
  } catch (err) {
    console.error("DB getPublicDocuments error:", err);
    return [];
  }
}

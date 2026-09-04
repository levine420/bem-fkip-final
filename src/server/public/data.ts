import "server-only";
import { db } from "./db";
import {
  activePeriod as seedPeriod,
  boardMembers as seedBoard,
  contents as seedContents,
  departments as seedDepartments,
  workPrograms as seedWorkPrograms,
} from "@/lib/data/public-data";

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

    if (period) return period;
  } catch (err) {
    console.warn("DB getActivePeriod fallback:", err);
  }

  return {
    id: seedPeriod.id,
    name: seedPeriod.name,
    visi: seedPeriod.visi || "",
    misi: seedPeriod.misi || "",
    photo_url: null,
    year_start: seedPeriod.year_start,
    year_end: seedPeriod.year_end,
  };
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

    if (items.length > 0) return { items, total };
  } catch (err) {
    console.warn("DB getPublishedContents fallback:", err);
  }

  // Fallback to seed contents
  let filtered = seedContents.filter((c) => c.status === "TERBIT");
  if (category) filtered = filtered.filter((c) => c.category === category);
  if (search) filtered = filtered.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  const mapped = filtered.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    excerpt: c.excerpt,
    thumbnail_url: c.thumbnail_url,
    category: c.category,
    tags: [],
    reading_time: c.reading_time,
    published_at: c.published_at,
    author: { name: "Tim Redaksi BEM" },
    department: { name: "BEM FKIP UIKA" },
  }));

  return {
    items: mapped.slice(offset, offset + limit),
    total: mapped.length,
  };
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
      await db.contents.update({
        where: { id: content.id },
        data: { view_count: { increment: 1 } },
      }).catch(() => {});
      return content;
    }
  } catch (err) {
    console.warn("DB getPublishedContentBySlug fallback:", err);
  }

  const found = seedContents.find((c) => c.slug === slug);
  if (!found) return null;

  return {
    id: found.id,
    title: found.title,
    slug: found.slug,
    seo_slug: found.seo_slug,
    meta_title: found.meta_title,
    meta_description: found.meta_description,
    excerpt: found.excerpt,
    body: found.body,
    thumbnail_url: found.thumbnail_url,
    category: found.category,
    tags: [],
    reading_time: found.reading_time,
    view_count: found.view_count,
    published_at: found.published_at,
    author: { name: "Tim Redaksi BEM" },
    department: { name: "BEM FKIP UIKA" },
  };
}

export async function getActiveBoardMembers() {
  try {
    const period = await getActivePeriod();
    if (period) {
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
          department: { select: { name: true } },
        },
        orderBy: { display_order: "asc" },
      });

      if (members.length > 0) return members;
    }
  } catch (err) {
    console.warn("DB getActiveBoardMembers fallback:", err);
  }

  return seedBoard.map((bm) => ({
    id: bm.id,
    name: bm.name,
    position: bm.position,
    photo_url: bm.photo_url,
    display_order: bm.display_order,
    department: { name: "BEM FKIP UIKA" },
  }));
}

export async function getActiveDepartments() {
  try {
    const period = await getActivePeriod();
    if (period) {
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

      if (departments.length > 0) return departments;
    }
  } catch (err) {
    console.warn("DB getActiveDepartments fallback:", err);
  }

  return seedDepartments.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.id,
    description: d.description,
    logo_url: d.logo_url,
  }));
}

export async function getDepartmentBySlug(slug: string) {
  try {
    const period = await getActivePeriod();
    if (period) {
      const department = await db.departments.findFirst({
        where: {
          slug,
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
            orderBy: { display_order: "asc" },
          },
        },
      });

      if (department) return department;
    }
  } catch (err) {
    console.warn("DB getDepartmentBySlug fallback:", err);
  }

  const found = seedDepartments.find((d) => d.id === slug || d.name.toLowerCase().includes(slug.toLowerCase()));
  if (!found) return null;

  return {
    id: found.id,
    name: found.name,
    slug: found.id,
    description: found.description,
    logo_url: found.logo_url,
    department_members_department: [],
  };
}

export async function getPublicStats() {
  try {
    const period = await getActivePeriod();
    if (period) {
      const [departments, programs, contents, events] = await Promise.all([
        db.departments.count({ where: { period_id: period.id, deleted_at: null } }),
        db.work_programs.count({ where: { period_id: period.id, deleted_at: null } }),
        db.contents.count({ where: { status: "TERBIT", deleted_at: null } }),
        db.events.count({ where: { period_id: period.id, deleted_at: null, status: { in: ["TERBIT", "BERJALAN", "SELESAI"] } } }),
      ]);

      if (departments > 0 || programs > 0 || contents > 0 || events > 0) {
        return { departments, programs, contents, events };
      }
    }
  } catch (err) {
    console.warn("DB getPublicStats fallback:", err);
  }

  return {
    departments: seedDepartments.length,
    programs: 4,
    contents: seedContents.length,
    events: 2,
  };
}

export async function getPublicWorkPrograms() {
  try {
    const period = await getActivePeriod();
    if (period) {
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

      if (items.length > 0) {
        return items.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status as any,
          display_order: p.display_order,
          department_id: p.department?.slug || p.department_id || "",
          period_id: period.id,
          target_waktu: p.target_time || "Periode Aktif (2026–2027)",
          sasaran: p.success_indicator || "Mahasiswa FKIP UIKA",
          created_at: "2026-08-01T00:00:00Z",
          updated_at: "2026-08-28T00:00:00Z",
        }));
      }
    }
  } catch (err) {
    console.warn("DB getPublicWorkPrograms fallback:", err);
  }

  return seedWorkPrograms;
}

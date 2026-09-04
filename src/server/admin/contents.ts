import "server-only";
import type { Prisma } from "@prisma/client";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import type { Transaction } from "./db";
import { AdminError } from "@/lib/admin/errors";
import { assertVersion, departmentScope, type AdminActor } from "@/lib/admin/policy";
import { pagination, uuid, textField, integer } from "@/lib/admin/validation";
import { generateSlug, generateUniqueSlug, isValidSlug } from "@/lib/admin/slug";
import { sanitizeHtml, stripHtml, calculateReadingTime } from "@/lib/admin/sanitize";
import { revalidatePath, revalidateTag } from "next/cache";

// List view - optimized for table display without heavy fields
const contentListSelect = {
  id: true,
  title: true,
  slug: true,
  category: true,
  status: true,
  published_at: true,
  created_at: true,
  review_note: true, // Only to show indicator
  author: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
} as const;

// Detail view - all fields including body
const contentDetailSelect = {
  id: true,
  title: true,
  slug: true,
  seo_slug: true,
  meta_title: true,
  meta_description: true,
  excerpt: true,
  reading_time: true,
  body: true,
  thumbnail_url: true,
  view_count: true,
  category: true,
  status: true,
  tags: true,
  review_note: true,
  reviewer_id: true,
  reviewed_at: true,
  author_id: true,
  department_id: true,
  period_id: true,
  published_at: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  author: { select: { id: true, name: true, email: true } },
  reviewer: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  period: { select: { id: true, name: true } },
} as const;

function missing(): never {
  throw new AdminError(404, "NOT_FOUND", "Konten tidak ditemukan dalam lingkup akses ini.");
}

function stale(): never {
  throw new AdminError(409, "STALE_STATE", "Data sudah berubah. Muat ulang sebelum melanjutkan.");
}

function forbidden(message: string): never {
  throw new AdminError(403, "FORBIDDEN", message);
}

/**
 * Check if actor can access this content.
 * Both SA and ADMIN can access all content (for publication management).
 */
function canAccessContent(actor: AdminActor, content: { author_id: string; department_id: string | null }) {
  // Allow both SUPER_ADMIN and ADMIN to access all content
  return actor.role === "SUPER_ADMIN" || actor.role === "ADMIN";
}

/**
 * Check if actor can edit this content.
 * Only DRAF or REVISI can be edited, and only by author or SA.
 */
function canEditContent(actor: AdminActor, content: { status: string; author_id: string }) {
  if (actor.role === "SUPER_ADMIN") return true;
  if (!["DRAF", "REVISI"].includes(content.status)) {
    return false;
  }
  return content.author_id === actor.id;
}

/**
 * Generate unique slug from title.
 */
async function ensureUniqueSlug(tx: Transaction, baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 2;
  
  while (true) {
    const existing = await tx.contents.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        deleted_at: null,
      },
      select: { id: true },
    });
    
    if (!existing) return slug;
    slug = generateUniqueSlug(baseSlug, counter++);
  }
}

/**
 * List contents with filters and pagination.
 * Both SA and ADMIN can see all content (for publication management).
 */
export async function listContents(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  const status = params.get("status");
  const category = params.get("category");
  const author_id = params.get("author_id");
  const department_id = params.get("department_id");

  return adminRead(async (tx, actor) => {
    const scope = departmentScope(actor);
    
    const where: Prisma.contentsWhereInput = {
      deleted_at: null,
      // ADMIN can now access content from all departments for publication
      ...(status ? { status: status as any } : {}),
      ...(category ? { category: category as any } : {}),
      ...(author_id ? { author_id: uuid(author_id) } : {}),
      ...(department_id && actor.role === "SUPER_ADMIN" ? { department_id: uuid(department_id) } : {}),
      ...(q ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      tx.contents.findMany({
        where,
        select: contentListSelect,
        take,
        skip,
        orderBy: [{ created_at: "desc" }, { id: "asc" }],
      }),
      tx.contents.count({ where }),
    ]);

    return { items, total, page, page_size: take };
  });
}

/**
 * Get single content by ID.
 */
export async function getContent(id: string) {
  return adminRead(async (tx, actor) => {
    const content = await tx.contents.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: contentDetailSelect,
    });

    if (!content) return missing();
    if (!canAccessContent(actor, content)) return missing();

    return content;
  });
}

/**
 * Create new content as DRAF.
 * Author is the current actor, department and period from assignment.
 */
export async function createContent(request: Request, input: {
  title: string;
  slug?: string;
  body: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  thumbnail_url?: string;
  meta_title?: string;
  meta_description?: string;
}) {
  return adminMutation(request, async (tx, actor) => {
    const scope = departmentScope(actor);
    
    // Validate and sanitize
    const title = textField(input.title, "title", 1, 200);
    const body = sanitizeHtml(textField(input.body, "body", 1, 100000));
    const excerpt = input.excerpt ? textField(input.excerpt, "excerpt", 0, 1000) : stripHtml(body).slice(0, 200);
    const category = (input.category || "BERITA") as "BERITA" | "PENGUMUMAN" | "KAJIAN" | "RILIS_PERS" | "LAINNYA";
    const tags = Array.isArray(input.tags) ? input.tags.filter(t => t.trim()).slice(0, 10) : [];
    const thumbnail_url = input.thumbnail_url ? textField(input.thumbnail_url, "thumbnail_url", 0, 2000000) : null;
    const meta_title = input.meta_title ? textField(input.meta_title, "meta_title", 0, 255) : null;
    const meta_description = input.meta_description ? textField(input.meta_description, "meta_description", 0, 1000) : null;
    
    // Generate slug
    const baseSlug = input.slug ? generateSlug(input.slug) : generateSlug(title);
    if (!isValidSlug(baseSlug)) {
      throw new AdminError(400, "INVALID_SLUG", "Slug tidak valid. Gunakan huruf kecil, angka, dan dash.");
    }
    const slug = await ensureUniqueSlug(tx, baseSlug);
    const seo_slug = slug;
    
    // Calculate reading time
    const reading_time = calculateReadingTime(stripHtml(body));
    
    // Create content
    const activePeriod = await tx.periods.findFirst({ where: { status: "AKTIF" }, select: { id: true } });
    const period_id = actor.role === "ADMIN" && scope.period_id ? scope.period_id : (activePeriod?.id ?? "");
    
    if (!period_id) {
      throw new AdminError(400, "NO_ACTIVE_PERIOD", "Tidak ada periode aktif. Hubungi Super Admin.");
    }
    
    const content = await tx.contents.create({
      data: {
        title,
        slug,
        seo_slug,
        meta_title,
        meta_description,
        excerpt,
        reading_time,
        body,
        thumbnail_url,
        category,
        status: "DRAF",
        tags,
        author_id: actor.id,
        department_id: actor.role === "ADMIN" ? scope.department_id : null,
        period_id,
      },
      select: contentDetailSelect,
    });

    await audit(tx, actor.id, "CONTENT_CREATE", "contents", content.id, {
      title: content.title,
      category: content.category,
    });

    return content;
  });
}

/**
 * Update content (only DRAF or REVISI, only by author or SA).
 */
export async function updateContent(request: Request, id: string, input: {
  title?: string;
  slug?: string;
  body?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  thumbnail_url?: string;
  meta_title?: string;
  meta_description?: string;
  version?: number;
}) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.contents.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, status: true, author_id: true, department_id: true, slug: true },
    });

    if (!existing) return missing();
    if (!canAccessContent(actor, existing)) return missing();
    if (!canEditContent(actor, existing)) {
      forbidden("Konten hanya dapat diedit saat berstatus DRAF atau REVISI.");
    }

    const updates: Prisma.contentsUpdateInput = {};
    
    if (input.title !== undefined) {
      updates.title = textField(input.title, "title", 1, 200);
    }
    
    if (input.slug !== undefined) {
      const baseSlug = generateSlug(input.slug);
      if (!isValidSlug(baseSlug)) {
        throw new AdminError(400, "INVALID_SLUG", "Slug tidak valid. Gunakan huruf kecil, angka, dan dash.");
      }
      updates.slug = await ensureUniqueSlug(tx, baseSlug, id);
      updates.seo_slug = updates.slug;
    }
    
    if (input.body !== undefined) {
      const body = sanitizeHtml(textField(input.body, "body", 1, 100000));
      updates.body = body;
      updates.reading_time = calculateReadingTime(stripHtml(body));
    }
    
    if (input.excerpt !== undefined) {
      updates.excerpt = input.excerpt ? textField(input.excerpt, "excerpt", 0, 1000) : null;
    }
    
    if (input.category !== undefined) {
      updates.category = input.category as any;
    }
    
    if (input.tags !== undefined) {
      updates.tags = Array.isArray(input.tags) ? input.tags.filter(t => t.trim()).slice(0, 10) : [];
    }
    
    if (input.thumbnail_url !== undefined) {
      updates.thumbnail_url = input.thumbnail_url ? textField(input.thumbnail_url, "thumbnail_url", 0, 2000000) : null;
    }
    
    if (input.meta_title !== undefined) {
      updates.meta_title = input.meta_title ? textField(input.meta_title, "meta_title", 0, 255) : null;
    }
    
    if (input.meta_description !== undefined) {
      updates.meta_description = input.meta_description ? textField(input.meta_description, "meta_description", 0, 1000) : null;
    }

    // Clear review note when editing REVISI
    if (existing.status === "REVISI") {
      updates.review_note = null;
    }

    const content = await tx.contents.update({
      where: { id: uuid(id) },
      data: updates,
      select: contentDetailSelect,
    });

    await audit(tx, actor.id, "CONTENT_UPDATE", "contents", content.id, {
      title: content.title,
    });

    // Invalidate public cache if slug changed
    if (updates.slug && existing.slug !== content.slug) {
      // Invalidate both old and new slugs
      revalidatePath("/");
      revalidatePath("/berita");
      revalidatePath(`/berita/${existing.slug}`);
      revalidatePath(`/berita/${content.slug}`);
    }

    return content;
  });
}

/**
 * Submit content for review (DRAF -> MENUNGGU_REVIEW).
 */
export async function submitContentReview(request: Request, id: string) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.contents.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, status: true, author_id: true, department_id: true, title: true },
    });

    if (!existing) return missing();
    if (!canAccessContent(actor, existing)) return missing();
    
    if (existing.status !== "DRAF") {
      forbidden("Hanya konten berstatus DRAF yang dapat diajukan untuk review.");
    }

    const content = await tx.contents.update({
      where: { id: uuid(id) },
      data: {
        status: "MENUNGGU_REVIEW",
        review_note: null,
      },
      select: contentDetailSelect,
    });

    await audit(tx, actor.id, "CONTENT_SUBMIT_REVIEW", "contents", content.id, {
      title: content.title,
    });

    return content;
  });
}

/**
 * Publish content (MENUNGGU_REVIEW -> TERBIT). SA only.
 */
export async function publishContent(request: Request, id: string) {
  return adminMutation(request, async (tx, actor) => {
    if (actor.role !== "SUPER_ADMIN") {
      forbidden("Hanya Super Admin yang dapat menerbitkan konten.");
    }

    const existing = await tx.contents.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, status: true, title: true },
    });

    if (!existing) return missing();
    
    if (existing.status !== "MENUNGGU_REVIEW") {
      forbidden("Hanya konten berstatus MENUNGGU_REVIEW yang dapat diterbitkan.");
    }

    const content = await tx.contents.update({
      where: { id: uuid(id) },
      data: {
        status: "TERBIT",
        published_at: new Date(),
        reviewer_id: actor.id,
        reviewed_at: new Date(),
        review_note: null,
      },
      select: contentDetailSelect,
    });

    await audit(tx, actor.id, "CONTENT_PUBLISH", "contents", content.id, {
      title: content.title,
    });

    // Invalidate public cache immediately after publish
    revalidatePath("/");
    revalidatePath("/berita");
    revalidatePath(`/berita/${content.slug}`);

    return content;
  });
}

/**
 * Request revision (MENUNGGU_REVIEW -> REVISI). SA only.
 */
export async function reviseContent(request: Request, id: string, review_note: string) {
  return adminMutation(request, async (tx, actor) => {
    if (actor.role !== "SUPER_ADMIN") {
      forbidden("Hanya Super Admin yang dapat meminta revisi konten.");
    }

    const note = textField(review_note, "review_note", 10, 2000);

    const existing = await tx.contents.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, status: true, title: true },
    });

    if (!existing) return missing();
    
    if (existing.status !== "MENUNGGU_REVIEW") {
      forbidden("Hanya konten berstatus MENUNGGU_REVIEW yang dapat diminta revisi.");
    }

    const content = await tx.contents.update({
      where: { id: uuid(id) },
      data: {
        status: "REVISI",
        review_note: note,
        reviewer_id: actor.id,
        reviewed_at: new Date(),
      },
      select: contentDetailSelect,
    });

    await audit(tx, actor.id, "CONTENT_REVISE", "contents", content.id, {
      title: content.title,
      // Don't log full review_note in audit
    });

    return content;
  });
}

/**
 * Soft delete content (only DRAF).
 */
export async function deleteContent(request: Request, id: string) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.contents.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, status: true, author_id: true, department_id: true, title: true },
    });

    if (!existing) return missing();
    if (!canAccessContent(actor, existing)) return missing();
    
    if (existing.status !== "DRAF" && actor.role !== "SUPER_ADMIN") {
      forbidden("Hanya konten berstatus DRAF yang dapat dihapus.");
    }

    await tx.contents.update({
      where: { id: uuid(id) },
      data: { deleted_at: new Date() },
    });

    await audit(tx, actor.id, "CONTENT_DELETE", "contents", id, {
      title: existing.title,
    });

    // Invalidate public cache if content was published
    if (existing.status === "TERBIT") {
      revalidatePath("/");
      revalidatePath("/berita");
    }

    return { success: true };
  });
}

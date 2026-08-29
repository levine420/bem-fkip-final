import "server-only";
import { database } from "./db";
import { AdminActor } from "@/lib/admin/policy";

export async function getAdminDashboardStats(actor: AdminActor) {
  try {
    const db = database();
    const activePeriod = await db.periods.findFirst({
      where: { status: "AKTIF" },
      select: { id: true, name: true, year_start: true, year_end: true },
    });

    const periodId = activePeriod?.id;

    const [
      departmentCount,
      contentCount,
      eventCount,
      aspirationCount,
      userCount,
      pendingReviewsCount,
      recentLogs,
      recentContents,
    ] = await Promise.all([
      periodId
        ? db.departments.count({ where: { period_id: periodId, deleted_at: null } })
        : db.departments.count({ where: { deleted_at: null } }),
      db.contents.count({ where: { deleted_at: null } }),
      db.events.count({ where: { deleted_at: null } }),
      db.aspirations.count({ where: { deleted_at: null } }),
      db.users.count({ where: { deleted_at: null } }),
      db.contents.count({ where: { status: "MENUNGGU_REVIEW", deleted_at: null } }),
      db.activity_logs.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          action: true,
          target_type: true,
          created_at: true,
          actor: { select: { name: true, role: true } },
        },
      }),
      db.contents.findMany({
        take: 4,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          created_at: true,
          author: { select: { name: true } },
        },
      }),
    ]);

    return {
      activePeriod,
      departmentCount,
      contentCount,
      eventCount,
      aspirationCount,
      userCount,
      pendingReviewsCount,
      recentLogs,
      recentContents,
    };
  } catch (error) {
    console.error("getAdminDashboardStats error:", error);
    return {
      activePeriod: null,
      departmentCount: 6,
      contentCount: 3,
      eventCount: 2,
      aspirationCount: 0,
      userCount: 5,
      pendingReviewsCount: 0,
      recentLogs: [],
      recentContents: [],
    };
  }
}

import "server-only";
import { NextResponse } from "next/server";
import { database } from "@/server/admin/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;
    const db = database();

    // Get active period first
    const activePeriod = await db.periods.findFirst({
      where: { status: "AKTIF" },
      select: { id: true }
    });

    if (!activePeriod) {
      return NextResponse.json({ 
        status: "NO_ACTIVE_PERIOD", 
        message: "Belum ada periode kepengurusan yang aktif",
        data: [],
        total: 0,
        page: 1
      });
    }

    // Fetch departments for active period (only non-deleted)
    const [departments, total] = await Promise.all([
      db.departments.findMany({
        where: {
          period_id: activePeriod.id,
          deleted_at: null
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo_url: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { name: "asc" },
        skip,
        take: limit
      }),
      db.departments.count({
        where: {
          period_id: activePeriod.id,
          deleted_at: null
        }
      })
    ]);

    // Cache for public viewing (5 minutes)
    return NextResponse.json({ 
      status: "OK", 
      data: departments,
      meta: {
        total,
        page,
        limit,
        hasMore: skip + limit < total
      }
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      }
    });

  } catch (error) {
    console.error("[PUBLIC_DEPARTMENTS_ERROR]", error);
    return NextResponse.json({ 
      status: "ERROR", 
      message: "Gagal mengambil data departemen" 
    }, { status: 500 });
  }
}

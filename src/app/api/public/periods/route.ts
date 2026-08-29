import "server-only";
import { NextResponse } from "next/server";
import { database } from "@/server/admin/db";

export async function GET() {
  try {
    const db = database();
    const activePeriod = await db.periods.findFirst({
      where: { status: "AKTIF" },
      select: {
        id: true,
        name: true,
        visi: true,
        misi: true,
        year_start: true,
        year_end: true,
        status: true,
      },
      orderBy: { year_start: "desc" }
    });

    if (!activePeriod) {
      return NextResponse.json({ 
        status: "NO_ACTIVE_PERIOD", 
        message: "Belum ada periode kepengurusan yang aktif",
        data: null 
      }, { status: 404 });
    }

    // Cache for public viewing (5 minutes)
    return NextResponse.json({ 
      status: "OK", 
      data: activePeriod 
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      }
    });

  } catch (error) {
    console.error("[PUBLIC_PERIODS_ERROR]", error);
    return NextResponse.json({ 
      status: "ERROR", 
      message: "Gagal mengambil data periode" 
    }, { status: 500 });
  }
}

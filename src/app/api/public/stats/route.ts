import { NextResponse } from "next/server";
import { getPublicStats } from "@/server/public/data";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const stats = await getPublicStats();
    
    return NextResponse.json({
      data: stats,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("public.stats.failed", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getActivePeriod } from "@/server/public/data";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const period = await getActivePeriod();
    
    return NextResponse.json({
      data: period,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("public.period.failed", error);
    return NextResponse.json(
      { error: "Failed to fetch active period" },
      { status: 500 }
    );
  }
}

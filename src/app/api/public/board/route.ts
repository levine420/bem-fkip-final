import { NextResponse } from "next/server";
import { getActiveBoardMembers } from "@/server/public/data";

export const dynamic = "force-dynamic";
export const revalidate = 120;

export async function GET() {
  try {
    const members = await getActiveBoardMembers();
    
    return NextResponse.json({
      data: members,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
      },
    });
  } catch (error) {
    console.error("public.board.failed", error);
    return NextResponse.json(
      { error: "Failed to fetch board members" },
      { status: 500 }
    );
  }
}

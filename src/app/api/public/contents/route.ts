import { NextResponse } from "next/server";
import { getPublishedContents } from "@/server/public/data";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("q") || undefined;

    const result = await getPublishedContents({
      category,
      limit: Math.min(limit, 50), // Max 50
      offset,
      search,
    });

    return NextResponse.json({
      data: result,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("public.contents.failed", error);
    return NextResponse.json(
      { error: "Failed to fetch contents" },
      { status: 500 }
    );
  }
}

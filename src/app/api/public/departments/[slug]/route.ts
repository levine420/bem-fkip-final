import { NextResponse } from "next/server";
import { getDepartmentBySlug } from "@/server/public/data";

export const dynamic = "force-dynamic";
export const revalidate = 120;

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const department = await getDepartmentBySlug(slug);

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: department,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
      },
    });
  } catch (error) {
    console.error("public.department.failed", error);
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { registerForEvent } from "@/server/public/register-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerForEvent(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("public.events.register.error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menyimpan pendaftaran kegiatan." },
      { status: 400 }
    );
  }
}

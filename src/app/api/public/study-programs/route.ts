import { NextResponse } from "next/server";
import { db } from "@/server/public/db";

export async function GET() {
  try {
    const programs = await db.study_programs.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });
    if (programs.length > 0) return NextResponse.json({ data: programs });
  } catch (err) {
    console.warn("DB study programs fallback:", err);
  }

  // Fallback study programs for FKIP UIKA
  return NextResponse.json({
    data: [
      { id: "sp-1", code: "PBI", name: "Pendidikan Bahasa Inggris" },
      { id: "sp-2", code: "PBSI", name: "Pendidikan Bahasa dan Sastra Indonesia" },
      { id: "sp-3", code: "PJKR", name: "Pendidikan Jasmani Kesehatan dan Rekreasi" },
      { id: "sp-4", code: "PMAT", name: "Pendidikan Matematika" },
      { id: "sp-5", code: "PGPAUD", name: "Pendidikan Guru Pendidikan Anak Usia Dini" },
    ],
  });
}

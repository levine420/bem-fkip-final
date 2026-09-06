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
      orderBy: { code: "asc" },
    });
    if (programs.length > 0) return NextResponse.json({ data: programs });
  } catch (err) {
    console.warn("DB study programs fallback:", err);
  }

  // Official 5 S1 Study Programs for FKIP UIKA Bogor
  return NextResponse.json({
    data: [
      { id: "sp-pbi", code: "PBI", name: "Pendidikan Bahasa Inggris" },
      { id: "sp-pmat", code: "PMAT", name: "Pendidikan Matematika" },
      { id: "sp-pls", code: "PLS", name: "Pendidikan Masyarakat / Pendidikan Luar Sekolah" },
      { id: "sp-tp", code: "TP", name: "Teknologi Pendidikan" },
      { id: "sp-pvdf", code: "PVDF", name: "Pendidikan Vokasional Desain Fashion" },
    ],
  });
}

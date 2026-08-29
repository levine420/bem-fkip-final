import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/server/public/student-auth";
import { getStudentAspirations, submitStudentAspiration } from "@/server/public/student-portal-data";

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: { message: "Silakan login terlebih dahulu." } }, { status: 401 });
  }

  const aspirations = await getStudentAspirations(student.id);
  return NextResponse.json({ data: aspirations });
}

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: { message: "Silakan login terlebih dahulu." } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await submitStudentAspiration(student.id, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || "Gagal mengirimkan aspirasi." } },
      { status: 400 }
    );
  }
}

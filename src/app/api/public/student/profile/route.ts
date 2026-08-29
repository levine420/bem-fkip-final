import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/server/public/student-auth";
import { changeStudentPassword, updateStudentProfile } from "@/server/public/student-portal-data";

export async function PATCH(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: { message: "Silakan login terlebih dahulu." } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateStudentProfile(student.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || "Gagal memperbarui profil." } },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: { message: "Silakan login terlebih dahulu." } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await changeStudentPassword(student.id, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || "Gagal mengganti password." } },
      { status: 400 }
    );
  }
}

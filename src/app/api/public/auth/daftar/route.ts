import { NextResponse } from "next/server";
import { registerStudent } from "@/server/public/student-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const student = await registerStudent(body);
    return NextResponse.json({ success: true, data: student });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || "Gagal mendaftarkan akun mahasiswa." } },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { loginStudent } from "@/server/public/student-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const result = await loginStudent(email, password);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || "Gagal masuk. Periksa kembali email & password Anda." } },
      { status: 401 }
    );
  }
}

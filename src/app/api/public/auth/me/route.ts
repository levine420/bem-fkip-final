import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/server/public/student-auth";

export async function GET() {
  const student = await getCurrentStudent();
  return NextResponse.json({ student });
}

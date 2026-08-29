import { NextResponse } from "next/server";
import { logoutStudent } from "@/server/public/student-auth";

export async function POST() {
  await logoutStudent();
  return NextResponse.json({ success: true });
}

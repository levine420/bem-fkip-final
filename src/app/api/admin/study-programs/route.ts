import { listStudyPrograms, createStudyProgram } from "@/server/admin/study-programs";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return respond(() => listStudyPrograms(new URL(request.url).searchParams)); }
export async function POST(request: Request) { return respond(async () => createStudyProgram(request, await jsonInput(request)), 201); }

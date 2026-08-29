import { listWorkPrograms, createWorkProgram } from "@/server/admin/work-programs";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return respond(() => listWorkPrograms(new URL(request.url).searchParams));
}

export async function POST(request: Request) {
  return respond(async () => createWorkProgram(request, await jsonInput(request) as any), 201);
}

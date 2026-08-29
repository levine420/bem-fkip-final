import { listOrganization, createDepartment } from "@/server/admin/organization";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return respond(() => listOrganization("departments", new URL(request.url).searchParams));
}
export async function POST(request: Request) {
  return respond(async () => createDepartment(request, await jsonInput(request)), 201);
}

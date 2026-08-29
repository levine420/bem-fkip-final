import { listOrganization, createMember } from "@/server/admin/organization";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return respond(() => listOrganization("board-members", new URL(request.url).searchParams));
}
export async function POST(request: Request) {
  return respond(async () => createMember(request, "board-members", await jsonInput(request)), 201);
}

import { listUsers, createAdmin } from "@/server/admin/access";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return respond(() => listUsers(new URL(request.url).searchParams)); }
export async function POST(request: Request) { return respond(async () => createAdmin(request, await jsonInput(request)), 201); }

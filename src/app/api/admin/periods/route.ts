import { createPeriod, listPeriods } from "@/server/admin/periods";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return respond(() => listPeriods(new URL(request.url).searchParams)); }
export async function POST(request: Request) { return respond(async () => createPeriod(request, await jsonInput(request)), 201); }

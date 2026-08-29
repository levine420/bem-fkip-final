import { csrfToken } from "@/server/admin/auth";
import { respond } from "@/server/admin/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return respond(async () => ({ csrf: await csrfToken() })); }

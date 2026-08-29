import { login } from "@/server/admin/auth";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export async function POST(request: Request) { return respond(async () => login(request, await jsonInput(request))); }

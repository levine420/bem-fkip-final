import { changePassword } from "@/server/admin/auth";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export async function POST(request: Request) { return respond(async () => changePassword(request, await jsonInput(request))); }

import { changeUserAccess } from "@/server/admin/access";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => changeUserAccess(request, (await context.params).id, "disable", await jsonInput(request)));
}

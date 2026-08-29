import { editAdmin } from "@/server/admin/access";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => editAdmin(request, (await context.params).id, await jsonInput(request)));
}

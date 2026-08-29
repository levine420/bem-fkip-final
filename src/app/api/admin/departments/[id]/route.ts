import { editDepartment, deleteDepartment } from "@/server/admin/organization";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  return respond(async () => editDepartment(request, (await context.params).id, await jsonInput(request)));
}
export async function DELETE(request: Request, context: Context) {
  return respond(async () => deleteDepartment(request, (await context.params).id, await jsonInput(request)));
}

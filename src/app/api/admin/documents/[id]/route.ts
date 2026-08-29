import { updateDocument, deleteDocument } from "@/server/admin/documents";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return respond(async () => updateDocument(request, id, await jsonInput(request) as any));
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return respond(() => deleteDocument(request, id));
}

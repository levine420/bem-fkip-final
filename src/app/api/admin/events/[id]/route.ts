import { updateEvent, deleteEvent } from "@/server/admin/events";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return respond(async () => updateEvent(request, id, await jsonInput(request) as any));
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return respond(() => deleteEvent(request, id));
}

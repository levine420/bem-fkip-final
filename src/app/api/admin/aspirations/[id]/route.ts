import { respondAspiration } from "@/server/admin/aspirations";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return respond(async () => respondAspiration(request, id, await jsonInput(request) as any));
}

import { listEventRegistrations, updateRegistrationStatus } from "@/server/admin/events";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return respond(() => listEventRegistrations(id, new URL(request.url).searchParams));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const input = await jsonInput(request) as { registration_id: string; status: string; decision_note?: string };
  return respond(() => updateRegistrationStatus(request, id, input.registration_id, input));
}

import { listEvents, createEvent } from "@/server/admin/events";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return respond(() => listEvents(new URL(request.url).searchParams));
}

export async function POST(request: Request) {
  return respond(async () => createEvent(request, await jsonInput(request) as any), 201);
}

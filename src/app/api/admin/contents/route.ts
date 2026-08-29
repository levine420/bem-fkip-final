import { listContents, createContent } from "@/server/admin/contents";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return respond(() => listContents(new URL(request.url).searchParams));
}

export async function POST(request: Request) {
  return respond(async () => createContent(request, await jsonInput(request) as any), 201);
}

import { listDocuments, createDocument } from "@/server/admin/documents";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return respond(() => listDocuments(new URL(request.url).searchParams));
}

export async function POST(request: Request) {
  return respond(async () => createDocument(request, await jsonInput(request) as any), 201);
}

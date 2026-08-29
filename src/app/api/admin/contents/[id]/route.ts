import { getContent, updateContent, deleteContent } from "@/server/admin/contents";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return respond(() => getContent(id));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await jsonInput(request);
  return respond(() => updateContent(request, id, input as any));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return respond(() => deleteContent(request, id));
}

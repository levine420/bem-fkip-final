import { reviseContent } from "@/server/admin/contents";
import { jsonInput, respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await jsonInput(request) as { review_note: string };
  return respond(() => reviseContent(request, id, input.review_note));
}

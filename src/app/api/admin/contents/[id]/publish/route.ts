import { publishContent } from "@/server/admin/contents";
import { respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return respond(() => publishContent(request, id));
}

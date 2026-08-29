import { listAspirations } from "@/server/admin/aspirations";
import { respond } from "@/server/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return respond(() => listAspirations(new URL(request.url).searchParams));
}

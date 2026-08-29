import { organizationPeriods } from "@/server/admin/organization";
import { respond } from "@/server/admin/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return respond(() => organizationPeriods(new URL(request.url).searchParams));
}

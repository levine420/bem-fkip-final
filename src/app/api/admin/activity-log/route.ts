import { listLogs } from "@/server/admin/logs";
import { respond } from "@/server/admin/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return respond(() => listLogs(new URL(request.url).searchParams)); }

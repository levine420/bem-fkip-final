import { logout } from "@/server/admin/auth";
import { respond } from "@/server/admin/http";
export const runtime = "nodejs";
export async function POST(request: Request) { return respond(() => logout(request)); }

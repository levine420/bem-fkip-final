import { editStudyProgram, deleteStudyProgram } from "@/server/admin/study-programs";
import { jsonInput, respond } from "@/server/admin/http";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) { return respond(async () => editStudyProgram(request, (await context.params).id, await jsonInput(request))); }
export async function DELETE(request: Request, context: Context) { return respond(async () => deleteStudyProgram(request, (await context.params).id, await jsonInput(request))); }

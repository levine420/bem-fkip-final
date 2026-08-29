import "server-only";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { AdminError } from "@/lib/admin/errors";
export async function jsonInput(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new AdminError(415, "CONTENT_TYPE", "Gunakan data JSON.");
  // Bound the stream, not just an untrusted Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) throw new AdminError(400, "BODY", "Data belum dikirim.");
  let bytes = 0; const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    bytes += value.byteLength;
    if (bytes > 32768) { await reader.cancel(); throw new AdminError(413, "BODY_TOO_LARGE", "Data terlalu besar."); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; }
  catch { throw new AdminError(400, "JSON", "Format JSON tidak valid."); }
}
export async function respond(work: () => Promise<unknown>, status = 200) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  try { return NextResponse.json({ data: await work() }, { status, headers }); }
  catch (error) {
    if (error instanceof AdminError) return NextResponse.json({ error: { code: error.code, message: error.message, fields: error.fields } }, { status: error.status, headers });
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2003", "P2004", "P2025", "P2034"].includes(error.code)) {
      return NextResponse.json({ error: { code: "CONFLICT", message: "Data bentrok atau tidak dapat diubah. Muat ulang dan periksa kembali." } }, { status: 409, headers });
    }
    // No Prisma query, request body, token or PII in application logs.
    console.error("admin.request.failed", { type: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: { code: "UNAVAILABLE", message: "Layanan Admin belum tersedia. Coba lagi atau hubungi pengelola." } }, { status: 503, headers });
  }
}

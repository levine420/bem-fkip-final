import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { message: "Pilih file gambar yang ingin diunggah." } },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: { message: "Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF." } },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { message: "Ukuran gambar terlalu besar. Maksimal 5 MB." } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let publicUrl = "";

    try {
      // Try local filesystem first
      const uploadsDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `banner-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
      const filePath = join(uploadsDir, filename);

      await writeFile(filePath, buffer);
      publicUrl = `/uploads/${filename}`;
    } catch {
      // Fallback for Vercel Serverless read-only filesystem (/var/task/public)
      const mimeType = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      publicUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: { message: error?.message || "Gagal mengunggah berkas gambar." } },
      { status: 500 }
    );
  }
}

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

    // For Vercel deployment: Use external URL input instead
    // Since filesystem is read-only, return error with guidance
    if (process.env.VERCEL) {
      return NextResponse.json(
        { 
          error: { 
            message: "Untuk upload di production, gunakan tab 'Gunakan Link URL' dan masukkan URL gambar dari Imgur, ImgBB, atau hosting gambar lainnya." 
          } 
        },
        { status: 400 }
      );
    }

    // Local development: save to public/uploads
    try {
      const uploadsDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `banner-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
      const filePath = join(uploadsDir, filename);

      await writeFile(filePath, buffer);
      const publicUrl = `/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error("File write error:", error);
      return NextResponse.json(
        { 
          error: { 
            message: "Gagal menyimpan file. Gunakan tab 'Gunakan Link URL' untuk memasukkan URL gambar dari hosting eksternal." 
          } 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: { message: error?.message || "Gagal mengunggah berkas gambar." } },
      { status: 500 }
    );
  }
}

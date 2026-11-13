import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

// Supabase Storage configuration (using S3-compatible API)
const s3Client = new S3Client({
  region: "ap-southeast-1",
  endpoint: "https://s3.ap-southeast-1.supabase.storage",
  credentials: {
    accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "bem-fkip-banners";

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

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `banner-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      
      // Return public URL
      const publicUrl = `https://${BUCKET_NAME}.supabase.co/${filename}`;
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: file.name,
        size: file.size,
      });
    } catch (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      // Fallback to Vercel Blob if Supabase fails
      // Vercel Blob supports larger files and is designed for serverless
      return NextResponse.json(
        { error: { message: "Gagal mengunggah gambar ke storage. Coba lagi atau upload ukuran lebih kecil." } },
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

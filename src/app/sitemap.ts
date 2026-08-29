import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bemfkip-uika.vercel.app";

  const routes = [
    "",
    "/organisasi",
    "/organisasi/struktur",
    "/organisasi/departemen",
    "/organisasi/program-kerja",
    "/organisasi/arsip-kabinet",
    "/kegiatan",
    "/kegiatan/kalender",
    "/berita",
    "/dokumen",
    "/galeri",
    "/layanan",
    "/layanan/bank-aspirasi",
    "/tentang",
    "/tentang/sejarah-bem",
    "/kontak",
    "/kebijakan-privasi",
    "/syarat-ketentuan",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}

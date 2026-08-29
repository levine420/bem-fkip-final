import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BEM FKIP UIKA — Platform Digital Resmi Mahasiswa FKIP UIKA Bogor",
    template: "%s | BEM FKIP UIKA Bogor",
  },
  description:
    "Platform digital resmi Badan Eksekutif Mahasiswa (BEM) Fakultas Keguruan dan Ilmu Pendidikan (FKIP) Universitas Ibn Khaldun (UIKA) Bogor. Layanan mahasiswa, kegiatan kampus, bank aspirasi, dan transparansi organisasi.",
  keywords: [
    "BEM FKIP UIKA",
    "BEM FKIP Universitas Ibn Khaldun",
    "FKIP UIKA Bogor",
    "Badan Eksekutif Mahasiswa FKIP UIKA",
    "Mahasiswa UIKA Bogor",
    "Kegiatan BEM FKIP UIKA",
    "Aspirasi Mahasiswa UIKA",
    "UIKA Bogor",
  ],
  authors: [{ name: "BEM FKIP UIKA Bogor" }],
  openGraph: {
    title: "BEM FKIP UIKA — Platform Digital Resmi Mahasiswa FKIP UIKA Bogor",
    description:
      "Platform digital resmi BEM FKIP UIKA Bogor untuk informasi, kegiatan, layanan mahasiswa, bank aspirasi, dan transparansi organisasi.",
    url: "https://bemfkip-uika.vercel.app",
    siteName: "BEM FKIP UIKA Bogor",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/hero-banner.png",
        width: 1200,
        height: 630,
        alt: "BEM FKIP UIKA Bogor",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/images/logo-altiora.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      {/* overscrollBehavior none inline ensures it's applied before any stylesheet */}
      <body style={{ overscrollBehavior: "none" }}>{children}</body>
    </html>
  );
}

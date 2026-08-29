import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/admin/", "/portal/"],
    },
    sitemap: "https://bemfkip-uika.vercel.app/sitemap.xml",
  };
}

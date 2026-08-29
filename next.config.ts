import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: [
    "192.168.110.72",
    "192.168.110.72:3000",
    "localhost:3000",
    "0.0.0.0:3000",
  ],
};

export default nextConfig;

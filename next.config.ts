import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options",        value: "DENY" },
        { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;

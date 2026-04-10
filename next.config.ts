import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: "export" since we need API routes
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

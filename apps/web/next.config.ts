import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker/self-hosted builds, not on Vercel
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;

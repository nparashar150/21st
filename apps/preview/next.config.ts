import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@21st/ai-writer', '@21st/query-builder', '@21st/timeline', '@21st/api-playground'],
};

export default nextConfig;

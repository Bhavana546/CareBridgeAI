import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/CareBridgeAI",
  assetPrefix: "/CareBridgeAI/",
};

export default nextConfig;

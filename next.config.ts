import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/threatlens",
  assetPrefix: "/threatlens",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

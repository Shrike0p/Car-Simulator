import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: ["file-loader"],
    });
    return config;
  },
};

export default nextConfig;

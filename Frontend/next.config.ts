import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Evita que Next infiera /home/steven por un package-lock.json ajeno al app */
const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: appDir,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev.me",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.assets.so",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

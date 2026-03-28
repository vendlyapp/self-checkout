import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import withPWAInit from "@ducanh2912/next-pwa";

/** Evita que Next infiera /home/steven por un package-lock.json ajeno al app */
const appDir = path.dirname(fileURLToPath(import.meta.url));

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  scope: "/",
  sw: "sw.js",
  cacheStartUrl: true,
  dynamicStartUrl: true,
  extendDefaultRuntimeCaching: true,
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*/i,
        handler: "NetworkOnly",
        options: { cacheName: "supabase-api" },
      },
      {
        urlPattern: ({ sameOrigin, url }) =>
          sameOrigin && url.pathname.startsWith("/api/"),
        handler: "NetworkOnly",
        options: { cacheName: "apis" },
      },
    ],
  },
});

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

export default withPWA(nextConfig);

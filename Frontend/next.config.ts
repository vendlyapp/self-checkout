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
      // Auth — nunca cachear tokens/sesiones
      {
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/auth\/.*/i,
        handler: "NetworkOnly",
        options: { cacheName: "supabase-auth" },
      },
      // Storage (imágenes de productos) — CacheFirst, 7 días
      {
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "supabase-storage",
          expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Resto Supabase API — NetworkOnly
      {
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*/i,
        handler: "NetworkOnly",
        options: { cacheName: "supabase-api" },
      },
      // Storefront público — StaleWhileRevalidate (buyer ve datos rápido)
      {
        urlPattern: ({ sameOrigin, url }: { sameOrigin: boolean; url: URL }) =>
          !sameOrigin && url.pathname.startsWith("/api/storefront/"),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "storefront-api",
          expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
        },
      },
      // APIs internas — NetworkFirst con fallback
      {
        urlPattern: ({ sameOrigin, url }: { sameOrigin: boolean; url: URL }) =>
          sameOrigin && url.pathname.startsWith("/api/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "internal-api",
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 100, maxAgeSeconds: 60 },
        },
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
        hostname:
          process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME ?? "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
